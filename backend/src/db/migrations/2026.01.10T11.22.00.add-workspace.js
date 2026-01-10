export const up = async ({ context }) => {
  const users = await context.collection("users").find({}).toArray();

  for (const user of users) {
    const existingWorkspace = await context
      .collection("workspaces")
      .findOne({ "owner.userId": user._id });

    if (!existingWorkspace) {
      const workspace = await context.collection("workspaces").insertOne({
        title: `${user.username}'s Workspace`,
        description: `Default workspace for ${user.fullname}`,
        owner: {
          userId: user._id,
          username: user.username,
          fullname: user.fullname,
        },
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await context
        .collection("boards")
        .updateMany(
          { "owner.userId": user._id },
          { $set: { workspaceId: workspace.insertedId } }
        );
    }
  }
};

export const down = async ({ context }) => {
  await context
    .collection("boards")
    .updateMany({}, { $unset: { workspaceId: 1 } });
  await context.collection("workspaces").deleteMany({});
};
