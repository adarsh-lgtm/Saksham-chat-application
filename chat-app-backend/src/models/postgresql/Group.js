const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const User = require("./User");
const Group = sequelize.define(
  "Group",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    profilePicture: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);
// GroupMember junction table for many-to-many relationship
const GroupMember = sequelize.define(
  "GroupMember",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    groupId: {
      type: DataTypes.UUID,
      references: {
        model: Group,
        key: "id",
      },
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);
// Associations
// Group.belongsTo(User, { as: "admin", foreignKey: "adminId" });
// Group.belongsToMany(User, { through: GroupMember, as: "members" });
// User.belongsToMany(Group, { through: GroupMember, as: "groups" });

// ------------
Group.belongsTo(User, {
  foreignKey: "adminId",
  as: "admin",
});

// Group has many Users through GroupMember
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: "groupId",
  otherKey: "userId",
  as: "members",
});

// User has many Groups through GroupMember
User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: "userId",
  otherKey: "groupId",
  as: "groups",
});

// User has many Groups as admin
User.hasMany(Group, {
  foreignKey: "adminId",
  as: "adminGroups",
});
module.exports = { Group, GroupMember };
