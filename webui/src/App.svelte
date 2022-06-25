<script lang="ts">
    import DrawingBoard from "./lib/DrawingBoard.svelte";
    import Header from "./lib/Header.svelte";
    import { Router, Route } from "svelte-navigator";
    import ProjectList from "./lib/ProjectList.svelte";
</script>

<Router>
    <main>
        <Header />
        <Route path="/" primary={false}>
            <ProjectList />
        </Route>
        <Route path="/drawing-board" primary={false}>
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

        --background-color-1: #dcdcdc;
        --drawing-board-background-color: #181818;
        --node-background-color: #303030;
        --node-foreground-color: #cecece;
        --node-border-color: #7d9184;
        --node-input-color: #27cc8f;
        --node-output-color: #d42d89;
        --node-output-color-selected: #a95e88;
        --node-output-stroke-selected: #f5a5d1;
        --link-color: #ffffff;
        --panel-main: #303030;
        --highlight-color-main: #237763;
        --header-background-color: #333333;
        --header-separator-color: #333333;

        // vertical gradient color
        --gradient-1: linear-gradient(
            to bottom,
            rgb(224, 224, 224),
            rgb(186, 186, 186)
        );
    }

    main {
        padding-top: var(--header-height);
        width: 100%;
        height: 100%;
    }
</style>
