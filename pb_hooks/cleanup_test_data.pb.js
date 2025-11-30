/// <reference path="../pb_data/types.d.ts" />

// Cleanup test user data older than 24 hours when test user logs in
onRecordAfterAuthWithPasswordRequest((e) => {
    const testUserEmail = "test@example.com";

    // Only run cleanup for the test user
    if (e.record.get("email") !== testUserEmail) {
        return;
    }

    try {
        console.log(`Test user logged in: ${e.record.get("email")} (ID: ${e.record.id})`);

        // Calculate the cutoff time (24 hours ago)
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);
        const cutoffDate = cutoffTime.toISOString().split('T')[0]; // YYYY-MM-DD format

        console.log(`Deleting test user activities older than: ${cutoffDate}`);

        // Find all activities for the test user older than 24 hours
        const oldActivities = $app.dao().findRecordsByFilter(
            "activities",
            "user = {:userId} && date < {:cutoffDate}",
            "-created", // sort by created descending
            -1, // get all records
            0,  // skip 0
            { userId: e.record.id, cutoffDate: cutoffDate }
        );

        if (oldActivities.length === 0) {
            console.log("No old test activities to delete");
            return;
        }

        console.log(`Found ${oldActivities.length} old test activities to delete`);

        // Delete each old activity
        let deletedCount = 0;
        oldActivities.forEach((activity) => {
            try {
                $app.dao().deleteRecord(activity);
                deletedCount++;
            } catch (err) {
                console.error(`Error deleting activity ${activity.id}: ${err}`);
            }
        });

        console.log(`Successfully deleted ${deletedCount} test activities older than 24 hours`);

    } catch (err) {
        console.error("Error in test data cleanup:", err);
    }
}, "users");
