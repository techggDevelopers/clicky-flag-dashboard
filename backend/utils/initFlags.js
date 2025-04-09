const Flag = require('../models/Flag');

const initializeFlags = async () => {
  const count = await Flag.countDocuments();
  if (count === 0) {
    const initialFlags = [
      {
        name: "F1",
        label: "Danger",
        description: "Self Destruct & ShutDown"
      },
      {
        name: "F2",
        label: "Restore",
        description: "Self Restore & Start Apps"
      },
      {
        name: "F3",
        label: "Support",
        description: "Allow remote access for support"
      }
    ];

    await Flag.insertMany(initialFlags);
    console.log('Initial flags created');
  }
};

module.exports = initializeFlags;
