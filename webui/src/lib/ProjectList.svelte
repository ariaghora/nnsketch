<script>
    import ProjectListItem from "./ProjectListItem.svelte";

    const projectList = [
        { projectName: "Simple MLP", projectId: "1" },
        { projectName: "Example CNN", projectId: "2" },
        { projectName: "Project 3", projectId: "3" },
        { projectName: "Project 4", projectId: "4" },
        { projectName: "Project 5", projectId: "5" },
    ];
</script>

<!-- Create a grid for project list item -->
<div class="project-list">
    {#each projectList as project}
        <ProjectListItem
            projectName={project.projectName}
            projectId={project.projectId}
        />
    {/each}
</div>

<style lang="scss">
    .project-list {
        background-color: var(--background-color-1);
        height: 100vh;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 0.2fr));
        grid-template-rows: repeat(auto-fit, minmax(0px, 0.2fr));
        grid-gap: 40px;
        padding: 40px;
        font-size: 14px;
        font-weight: normal;
        text-align: left;
        cursor: pointer;
    }
</style>
