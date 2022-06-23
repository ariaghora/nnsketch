<script>
    import { onMount } from "svelte";
    import Prism from "prismjs";

    export let language;
    export let code;
    // Prism.highlight("var a = 1;", Prism.languages.python, "python");

    // onMount(() => {
    //     let script = document.createElement("script");
    //     script.src =
    //         "https://tutsplus.github.io/syntax-highlighter-demos/highlighters/Prism/prism.js";
    //     document.head.append(script);

    //     script.onload = function () {
    //         let lang_script;
    //         let lang_module;
    //         lang_module = "https://prismjs.com/components/prism-python.js";
    //         lang_script = document.createElement("script");
    //         lang_script.src = lang_module;
    //         lang_script.async = true;
    //         document.head.append(lang_script);

    //         lang_script.onload = () => {
    //             // Prism.highlightAll();
    //         };
    //     };
    // });
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Open+Sans:400,700"
        type="text/css"
    />
    <link
        rel="stylesheet"
        href="https://tutsplus.github.io/syntax-highlighter-demos/highlighters/Prism/prism_okaidia.css"
    />
    <!-- <script src="https://prismjs.com/components/prism-python.js"></script> -->
</svelte:head>

<div
    class="code"
    name="text-source-output"
    id="text-source-output"
    cols="30"
    rows="10"
>
    <pre><code class="language-{language}">
        <!-- {@html Prism.highlight(code, Prism.languages["python"])} -->
        {code}
        </code>
    </pre>
</div>

<style lang="scss">
    #text-source-output {
        display: block;
        width: 100%;
        // background-color: gray; //var(--panel-main);
        height: calc(100% - 35px);
        border: none;
        font-family: "Source Code Pro", Courier, monospace;
        font-size: 12px;
    }
    pre {
        display: block;
        overflow-y: scroll;
        height: calc(100% - 30px);
    }

    pre::before {
        display: none !important;
    }
</style>
