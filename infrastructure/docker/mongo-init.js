// MongoDB initialization script
db = db.getSiblingDB('elimuconnect');

// Create collections
db.createCollection('users');
db.createCollection('schools');
db.createCollection('contents');

// Create indexes for users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "schoolId": 1 });
db.users.createIndex({ "admissionNumber": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "tscNumber": 1 }, { unique: true, sparse: true });

// Create indexes for schools
db.schools.createIndex({ "nemisCode": 1 }, { unique: true });
db.schools.createIndex({ "county": 1 });
db.schools.createIndex({ "active": 1 });

// Create indexes for contents
db.contents.createIndex({ "subject": 1, "grade": 1 });
db.contents.createIndex({ "contentType": 1 });
db.contents.createIndex({ "published": 1 });
db.contents.createIndex({ "uploadedBy": 1 });
db.contents.createIndex({ "tags": 1 });

// Create text index for search
db.contents.createIndex({ 
    "title": "text", 
    "description": "text",
    "author": "text",
    "tags": "text"
});

print('Database initialized successfully');
