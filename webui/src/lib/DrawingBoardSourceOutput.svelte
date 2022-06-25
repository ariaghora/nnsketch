<script lang="ts">
    const btnCloseOnClick = function (e: MouseEvent) {
        document.getElementById("source-output-bg-overlay").style.display =
            "none";
    };
    export let python_code: string;
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
        rel="stylesheet"
    />
    <link
        rel="stylesheet"
        href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/default.min.css"
    />
    <script
        src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js"></script>
</svelte:head>

<div id="source-output-bg-overlay">
    <div id="source-output">
        <div id="source-output-header">
            <div id="source-output-header-title">
                <i class="fas fa-code" />
                <span>Source Code</span>
            </div>
            <div id="source-output-header-close">
                <span id="btn-close" on:click={btnCloseOnClick}>
                    <i class="fas fa-times" />
                </span>
            </div>
        </div>
        <div
            class="code"
            name="text-source-output"
            id="text-source-output"
            cols="30"
            rows="10"
        >
            <pre>{python_code}</pre>
        </div>
    </div>
</div>

<style lang="scss">
    #source-output-bg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: none;
    }
    #source-output {
        position: absolute;
        top: var(--source-output-panel-top);
        left: calc(50vw - var(--source-output-panel-width) / 2);
        width: var(--source-output-panel-width);
        height: calc(80% - var(--source-output-panel-top));
        border: 5px solid var(--panel-main);
        z-index: 100;
        background: var(--panel-main);
        font-family: "Source Code Pro", monospace;
        font-size: 14px;
        border-radius: 4px;
        #source-output-header {
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            line-height: 30px;
            background-color: var(--panel-main);
            border-bottom: 1px solid var(--panel-main);
            #btn-close {
                cursor: pointer;
                &:hover {
                    color: var(--highlight-color-main);
                }
            }
        }
        #text-source-output {
            display: block;
            width: 100%;
            color: white;
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
    }
</style>
