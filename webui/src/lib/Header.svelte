<script lang="ts">
    import { Link } from "svelte-navigator";
</script>

<svelte:head>
    <link
        href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
        rel="stylesheet"
    />
</svelte:head>

<div id="header">
    <ul id="menu-bar">
        <li class="wrapper">
            <Link class="my-link" to="/">Drawing</Link>
        </li>
        <li class="wrapper">
            <Link class="my-link" to="/about">Training</Link>
        </li>
    </ul>
</div>

<style lang="scss">
    #header {
        margin-bottom: var(--header-height);
        font-family: var(--monospace-font);
        color: #fff;
        background-color: var(--header-background-color);
        position: fixed;
        width: 100vw;
        top: 0px;
        height: var(--header-height);
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
        z-index: 100;
        #menu-bar {
            display: flex;
            align-items: center;
            list-style: none;
            padding-left: 20px;
            width: 400px;
            li {
                text-align: center;
                line-height: var(--header-height);
                font-size: 14px;
                color: #fff;
            }
        }

        .wrapper :global(.my-link) {
            text-decoration: none;
            color: #fff;
            display: block;
            // width: 100px;
            padding: 0 20px;
            &:hover {
                background-color: var(--highlight-color-main);
            }
        }

        .link-content {
            text-decoration: none;
            color: #fff;
        }
    }
</style>
