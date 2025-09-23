export class User {
  constructor({ id, username, age, isActive }) {
    this.id = id;
    this.username = username;

    this.age = age;
    this.isActive = isActive ?? true;
  }
}
