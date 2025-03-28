
const Flag = require('../models/Flag');

const initializeFlags = async () => {
  const count = await Flag.countDocuments();
  if (count === 0) {
    const initialFlags = [
      { 
        name: "F1", 
        label: "Analytics", 
        description: "Enable data collection and performance analytics",
        enabled: false
      },
      { 
        name: "F2", 
        label: "Dark Mode", 
        description: "Enable dark mode appearance throughout the app",
        enabled: false
      },
      { 
        name: "F3", 
        label: "Notifications", 
        description: "Enable push and email notifications for new events",
        enabled: false
      },
      { 
        name: "F4", 
        label: "Beta Features", 
        description: "Access experimental features before public release",
        enabled: false
      }
    ];
    
    await Flag.insertMany(initialFlags);
    console.log('Initial flags created');
  }
};

module.exports = initializeFlags;
