<script lang="ts">
    import DrawingBoard from "./lib/DrawingBoard.svelte";
    import Header from "./lib/Header.svelte";
    import { Router, Route } from "svelte-navigator";
</script>

<Router>
    <main>
        <Header />
        <Route path="/" primary={false}>
            <DrawingBoard />
        </Route>
        <Route path="/about" primary={false}>
            <h2>Come back later</h2>
        </Route>
    </main>
</Router>

<style lang="scss">
    // reset styles padding and margin
    :global(*) {
        padding: 0;
        margin: 0;
    }

    :global(:root) {
        --monospace-font: "Source Code Pro", Serif;
        --header-height: 40px;
        --source-output-panel-top: 150px;
        --source-output-panel-width: 50%;

        --drawing-board-background-color: rgb(116, 116, 116);
        --node-background-color: rgb(220, 220, 203);
        --node-border-color: rgb(227, 227, 10);
        --node-input-color: rgb(44, 157, 106);
        --node-output-color: rgb(157, 44, 106);
        --node-output-color-selected: rgb(169, 94, 136);
        --node-output-stroke-selected: rgb(245, 165, 209);
        --link-color: rgb(255, 255, 255);
        --panel-main: rgb(48, 48, 48);
        --highlight-color-main: rgb(35, 119, 99);
        --header-background-color: rgb(51, 51, 51);
        --header-separator-color: rgb(51, 51, 51);
    }

    main {
        padding-top: var(--header-height);
        width: 100%;
        height: 100%;
    }
</style>
