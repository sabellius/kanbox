import fs from "fs";
import path from "path";

export const up = async ({ context }) => {
  const seedPath = path.resolve(process.cwd(), "src/db/seed.json");
  const rawData = fs.readFileSync(seedPath, "utf-8");
  const { users, boards } = JSON.parse(rawData);

  // Seed Users
  for (const user of users) {
    const exists = await context
      .collection("users")
      .findOne({ email: user.email });
    if (!exists) {
      await context.collection("users").insertOne({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  const userDocs = await context.collection("users").find({}).toArray();
  const userMap = {};
  for (const user of userDocs) {
    userMap[user.username] = user;
  }

  // Seed Workspaces
  for (const user of userDocs) {
    const existingWorkspace = await context
      .collection("workspaces")
      .findOne({ "owner.userId": user._id });

    if (!existingWorkspace) {
      await context.collection("workspaces").insertOne({
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
    }
  }

  // Get created workspaces
  const workspaceDocs = await context
    .collection("workspaces")
    .find({})
    .toArray();
  const workspaceMap = {};
  for (const workspace of workspaceDocs) {
    workspaceMap[workspace.owner.username] = workspace;
  }

  // Seed Boards
  for (const board of boards) {
    const ownerUser = userMap[board.owner.username];
    const workspace = workspaceMap[board.owner.username];

    const owner = {
      userId: ownerUser._id,
      username: ownerUser.username,
      fullname: ownerUser.fullname,
    };

    const members = [];
    for (const m of board.members) {
      const memberUser = userMap[m.username];
      if (memberUser) {
        members.push({
          userId: memberUser._id,
          username: memberUser.username,
          fullname: memberUser.fullname,
        });
      }
    }

    const boardDoc = {
      title: board.title,
      description: board.description,
      workspaceId: workspace._id,
      labels: board.labels.map(label => ({
        title: label.title,
        color: label.color,
      })),
      owner,
      members,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const exists = await context.collection("boards").findOne({
      title: boardDoc.title,
      "owner.userId": boardDoc.owner.userId,
    });
    if (!exists) {
      await context.collection("boards").insertOne(boardDoc);
    }
  }
};

export const down = async ({ context }) => {
  const seedPath = path.resolve(process.cwd(), "src/db/seed.json");
  const rawData = fs.readFileSync(seedPath, "utf-8");
  const { users, boards } = JSON.parse(rawData);

  for (const user of users) {
    await context.collection("users").deleteOne({ email: user.email });
  }

  for (const board of boards) {
    await context.collection("boards").deleteOne({ title: board.title });
  }

  for (const user of users) {
    await context.collection("workspaces").deleteOne({
      title: `${user.username}'s Workspace`,
    });
  }
};
