class Editor {
    init() {
        console.log("Editor Loaded");
        (<any>require).config({ paths: { 'vs': './node_modules/monaco-editor/min/vs' } });
        (<any>require)(['vs/editor/editor.main'], function () {
            var diffEditor = monaco.editor.createDiffEditor(document.getElementById('container'));

            //diffEditor.updateOptions({ 'theme': "vs-dark" });
            function updateLayout() {
                $("#container").height($(window).height() - $("#header").height() - 80);
                diffEditor.layout();
            }

            $(window).resize(function () {
                updateLayout();
            });

            $("#swap_button").on("click", function () {
                var model = diffEditor.getModel();
                var tmp = model.original;
                model.original = model.modified;
                model.modified = tmp;
                diffEditor.setModel(model);
            });

            diffEditor.setModel({
                original: monaco.editor.createModel("", 'text'),
                modified: monaco.editor.createModel("", 'text'),
            });

            updateLayout();
        });
    }
}

var x = new Editor();
x.init();