<script lang="ts">
    export let projectId;
    export let projectName;
</script>

<div class="project-list-item">
    <div class="preview">
        <!-- preview image -->
    </div>
    <span class="project-list-item-name">
        {projectName}
    </span>
</div>

<style lang="scss">
    .project-list-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 200px;
        height: 120px;
        border-radius: 5px;
        background-image: var(--gradient-1);
        padding: 10px;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(162, 156, 156, 0.7);
        cursor: pointer;
        .project-list-item-name {
            font-family: var(--monospace-font);
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding-top: 10px;
        }
        .preview {
            width: 100%;
            height: 100%;
            background-color: #333;
            border-radius: 5px;
        }
    }
</style>
