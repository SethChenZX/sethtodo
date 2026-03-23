// MongoDB Migration Script
// Remove time-related fields from all todo documents
// Run this in MongoDB Atlas Shell or MongoDB Compass

// Connect to your database and run:
db.todos.updateMany(
  {},
  { 
    $unset: { 
      startTime: "", 
      endTime: "", 
      reminderMinutes: "", 
      lastReminderAt: "", 
      overdueReminderCount: "" 
    } 
  }
)

// Verify the fields are removed:
db.todos.findOne({})

// Expected: The document should not have startTime, endTime, reminderMinutes, lastReminderAt, overdueReminderCount fields
