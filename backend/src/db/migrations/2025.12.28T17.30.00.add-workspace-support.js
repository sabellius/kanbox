export const up = async ({ context }) => {
  const boardsCollection = context.collection("boards");
  const usersCollection = context.collection("users");
  const workspacesCollection = context.collection("workspaces");
  const workspaceMembersCollection = context.collection("workspace_members");

  const usersWithBoards = await boardsCollection.distinct("owner.userId");

  for (const userId of usersWithBoards) {
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) continue;

    const existingWorkspace = await workspacesCollection.findOne({
      name: `${user.username}'s Workspace`,
      ownerId: user._id,
    });

    if (existingWorkspace) {
      console.log(`User ${user.username} already has workspace, skipping...`);
      continue;
    }

    const workspaceResult = await workspacesCollection.insertOne({
      name: `${user.username}'s Workspace`,
      description: `Default workspace for ${user.fullname}`,
      ownerId: user._id,
      visibility: "private",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const workspaceId = workspaceResult.insertedId;

    await workspaceMembersCollection.insertOne({
      workspaceId,
      userId: user._id,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const boards = await boardsCollection
      .find({ "owner.userId": user._id })
      .toArray();

    await boardsCollection.updateMany(
      { "owner.userId": user._id },
      { $set: { workspaceId } }
    );

    console.log(
      `Created workspace "${user.username}'s Workspace" with ${boards.length} boards`
    );
  }

  console.log("Workspace migration completed successfully");
};

export const down = async ({ context }) => {
  const workspacesCollection = context.collection("workspaces");
  const boardsCollection = context.collection("boards");
  const workspaceMembersCollection = context.collection("workspace_members");

  const defaultWorkspaces = await workspacesCollection
    .find({ name: /'s Workspace$/ })
    .toArray();

  for (const workspace of defaultWorkspaces) {
    await boardsCollection.updateMany(
      { workspaceId: workspace._id },
      { $unset: { workspaceId: 1 } }
    );

    await workspaceMembersCollection.deleteMany({ workspaceId: workspace._id });

    await workspacesCollection.deleteOne({ _id: workspace._id });

    console.log(`Reverted workspace "${workspace.name}"`);
  }

  console.log("Workspace migration reverted successfully");
};
