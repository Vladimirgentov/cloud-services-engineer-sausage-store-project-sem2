db = db.getSiblingDB('sausage-store');
db.createUser({
  user: 'reports',
  pwd: 'reportspassword',
  roles: [
    {
      role: 'readWrite',
      db: 'sausage-store'
    }
  ]
});
