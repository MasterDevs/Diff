declare var nodeRequire: NodeRequire;

const {ipcRenderer} = nodeRequire('electron');

class Editor {
    private languages: string[];
    private themes = ["vs", "vs-dark"];
    private diffEditor: monaco.editor.IStandaloneDiffEditor;
    private languagePicker: JQuery;
    private static DEFAULT_LANGUAGE = "plaintext";
    private static EDITOR_ELEMENT = "editor";
    private static TOTAL_DIFFS_SPAN = "totalDiffs";
    private static CURRENT_LANG = "currentLanguage";

    createOption(text: string) {
        var o = document.createElement('option');
        o.textContent = text;
        return o;
    }

    init() {
        (<any>require).config({ paths: { 'vs': './node_modules/monaco-editor/min/vs' } });

        (<any>require)(['vs/editor/editor.main', 'fs', 'path', 'os'], () => {
            this.initLanguages();
            this.initMenu();
            this.setupListeners();

            var diff = this.diffEditor = monaco.editor.createDiffEditor(document.getElementById(Editor.EDITOR_ELEMENT), {
                theme: this.themes[1]
            });

            diff.setModel({
                original: monaco.editor.createModel("", Editor.DEFAULT_LANGUAGE),
                modified: monaco.editor.createModel("", Editor.DEFAULT_LANGUAGE),
            });
            $(`#${Editor.CURRENT_LANG}`).text(Editor.DEFAULT_LANGUAGE);

            diff.onDidUpdateDiff(() => {
                $(`#${Editor.TOTAL_DIFFS_SPAN}`).text(diff.getLineChanges().length);
            });
            window.onresize = () => {
                this.updateLayout();
            };
            this.updateLayout();
            diff.focus();
        });
    }

    changeLanguage(lang: string) {
        console.log(`Changing Language to ${lang}`);
        var model = this.diffEditor.getModel();
        model.original = monaco.editor.createModel(model.original.getValue(), lang);
        model.modified = monaco.editor.createModel(model.modified.getValue(), lang);
        this.diffEditor.setModel(model);
        $(`#${Editor.CURRENT_LANG}`).text(lang);
    }

    changeTheme(theme: string) {
        this.diffEditor.updateOptions({ theme });
    }

    initLanguages() {
        this.languages = (function () {
            var modesIds = monaco.languages.getLanguages().map(function (lang) { return lang.id; });
            modesIds.sort();
            return modesIds;
        })();
    }

    initMenu() {
        ipcRenderer.send("update-menu", { languages: this.languages, themes: this.themes });
    }

    setupListeners() {
        ipcRenderer.on('select-language', (ev, arg: string) => {
            this.changeLanguage(arg);
        });
        ipcRenderer.on('select-theme', (ev, arg) => {
            this.changeTheme(arg);
        });
        ipcRenderer.on('swap-panels', (ev, arg) => {
            var model = this.diffEditor.getModel();
            var tmp = model.original;
            model.original = model.modified;
            model.modified = tmp;
            this.diffEditor.setModel(model);
            this.diffEditor.focus();
        });
    }

    updateLayout() {
        $(`#${Editor.EDITOR_ELEMENT}`).height($(window).height() - 30);
        this.diffEditor.layout();
    }
}

new Editor().init();