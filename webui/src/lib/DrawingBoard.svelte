<script lang="ts">
    import "@svgdotjs/svg.draggable.js";
    import { onMount } from "svelte";
    import { DrawingBoard } from "../ts/DrawingBoard";
    import DrawingToolbar from "./DrawingToolbar.svelte";

    /**
     * node selector input will contain a list, each of which is based
     * on a item in following array.
     */
    let editor_nodes = [
        { name: "Input", type: "layer", n_in: 0, n_out: 1 },
        { name: "Output", type: "layer", n_in: 1, n_out: 0 },
        { name: "Conv2d", type: "layer", n_in: 1, n_out: 1 },
        { name: "MaxPool2d", type: "layer", n_in: 1, n_out: 1 },
        { name: "ReLU", type: "layer", n_in: 1, n_out: 1 },
        { name: "Add", type: "operation", n_in: 2, n_out: 1 },
        { name: "Multiply", type: "operation", n_in: 2, n_out: 1 },
        { name: "Script", type: "script", n_in: 1, n_out: 1 },
    ];

    /**
     * This variable stores filtered chosable nodes.
     */
    let filtered_editor_nodes = editor_nodes;

    /**
     * Our drawing board instance.
     */
    let drawingBoard: DrawingBoard;

    const nodeSelectorInputOnChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        filtered_editor_nodes = editor_nodes.filter((node) =>
            node.name.toLowerCase().includes(value.toLowerCase())
        );
        if (value.length == 0) {
            filtered_editor_nodes = editor_nodes;
        }
    };

    const drawingBoardOnClick = function (e: MouseEvent) {
        e.preventDefault();
        // Hide context menu wrapper
        document.getElementById("context-menu-wrapper").style.display = "none";
    };

    const drawingBoardOnRightClick = function (e: MouseEvent) {
        e.preventDefault();

        // Don't show context menu while in connecting mode
        if (drawingBoard.connectingMode) return;

        const rect = document
            .getElementById("drawing-board")
            .getBoundingClientRect();

        // Show context menu wrapper
        const menu = document.getElementById("context-menu-wrapper");
        menu.style.display = "block";
        menu.style.left = e.clientX + "px";
        menu.style.top = e.clientY + "px";

        drawingBoard.lastEventX = e.clientX - rect.x;
        drawingBoard.lastEventY = e.clientY - rect.y;

        // focus on node-selector-input
        const nodeSelectorInput: HTMLElement = document.getElementById(
            "node-selector-input"
        );
        nodeSelectorInput.focus();
        nodeSelectorInput.value = "";
        filtered_editor_nodes = editor_nodes;
    };

    const menuItemOnClick = function (e: MouseEvent) {
        const menu = document.getElementById("context-menu-wrapper");
        const nodeName = this.getAttribute("data-node-name");
        const nIn = parseInt(this.getAttribute("data-n-in"));
        const nOut = parseInt(this.getAttribute("data-n-out"));

        drawingBoard.addModuleNode(
            nodeName,
            Math.floor(drawingBoard.lastEventX / drawingBoard.smallGridSize) *
                drawingBoard.smallGridSize,
            Math.floor(drawingBoard.lastEventY / drawingBoard.smallGridSize) *
                drawingBoard.smallGridSize,
            nIn,
            nOut
        );
        menu.style.display = "none";
    };

    onMount(() => {
        drawingBoard = new DrawingBoard("#drawing-board");
        drawingBoard.drawingBoardSVG.on("click", drawingBoardOnClick);
        drawingBoard.drawingBoardSVG.on(
            "contextmenu",
            drawingBoardOnRightClick
        );
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
        rel="stylesheet"
    />
</svelte:head>

<DrawingToolbar {drawingBoard} />

<div>
    <svg id="drawing-board" />
</div>

<div id="context-menu-wrapper">
    <div id="node-selector-input-wrapper">
        <input
            id="node-selector-input"
            type="text"
            placeholder="Type to search node"
            on:input={nodeSelectorInputOnChange}
        />
    </div>

    <div id="context-menu">
        {#each filtered_editor_nodes as node}
            <div
                class="menu-item"
                on:click={menuItemOnClick}
                data-node-name={node.name}
                data-n-in={node.n_in}
                data-n-out={node.n_out}
            >
                <div class="menu-item-icon">
                    {#if node.type === "layer"}
                        <i class="fas fa-layer-group" />
                    {/if}
                    {#if node.type === "operation"}
                        <i class="fas fa-gears" />
                    {/if}
                </div>
                <div class="menu-item-text">{node.name}</div>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    #drawing-board {
        position: absolute;
        top: 0;
        cursor: crosshair;
        width: 100%;
        height: calc(100% - var(--header-height));
        background-color: var(--drawing-board-background-color);
        margin-top: var(--header-height);
    }
    #context-menu-wrapper {
        font-family: "Source Code Pro", Courier, monospace;
        position: absolute;
        background: var(--panel-main);
        display: none;
        border: 5px solid var(--panel-main);

        #context-menu {
            display: block;
            margin-top: 35px;
            width: 300px;
            height: 120px;
            overflow-y: scroll;
            box-shadow: inset 0px -5px 20px rgba(0, 0, 0, 0.5);
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8);
            .menu-item {
                display: flex;
                align-items: center;
                font-size: 12px;
                height: 32px;
                padding-left: 10px;
                color: white;
                cursor: pointer;
                &:hover {
                    background-color: var(--highlight-color-main);
                }
                .menu-item-icon {
                    width: 24px;
                    font-size: 12px;
                }
            }
        }
        #node-selector-input-wrapper {
            position: absolute;
            display: block;
            top: 0;
            left: 0;
            width: 100%;
            height: 24px;
            padding-top: 5px;
            background-color: white;
            border-radius: 4px;

            #node-selector-input {
                font-family: "Source Code Pro", Courier, monospace;
                font-size: 14px;
                display: block;
                width: 95%;
                border: none;
                outline: none;
                margin: 0 auto;
            }
        }
        border-radius: 4px;
    }
</style>
