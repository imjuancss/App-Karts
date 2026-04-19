import fs from 'fs';

const firstNames = ["Juan", "Carlos", "Luis", "Andres", "Miguel", "Santiago", "Mateo", "Sebastian", "Diego", "Nicolas", "Daniel", "David", "Felipe", "Camilo", "Alejandro", "Jose", "Fernando", "Jorge", "Ricardo", "Gabriel", "Maria", "Ana", "Laura", "Sofia", "Valentina", "Camila", "Valeria", "Isabella", "Daniela", "Mariana", "Gabriela", "Natalia", "Andrea", "Lucia", "Paula"];
const lastNames = ["Gomez", "Rodriguez", "Lopez", "Gonzalez", "Martinez", "Perez", "Garcia", "Sanchez", "Romero", "Suarez", "Diaz", "Hernandez", "Ramirez", "Torres", "Ruiz", "Vargas", "Castro", "Mendoza", "Guzman", "Ortiz", "Navarro", "Rios", "Silva", "Morales", "Cruz", "Reyes", "Alvarez", "Gaitan", "Osorio", "Marquez"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

const users = [];

// Generar 100 usuarios
for (let i = 1; i <= 100; i++) {
  const fName = firstNames[getRandomInt(0, firstNames.length - 1)];
  const lName = lastNames[getRandomInt(0, lastNames.length - 1)];
  const fullName = `${fName} ${lName}`;
  const username = `${fName[0].toLowerCase()}${lName.toLowerCase()}${getRandomInt(10, 999)}`;
  const email = `${username}@mockkarting.com`;
  const dob = generateRandomDate(new Date(1980, 0, 1), new Date(2005, 11, 31));
  const password = `KartsTest${getRandomInt(100,999)}!`;

  users.push({ id: i, fullName, username, email, dob, password });
}

// Write to CSV
const csvContent = "ID,Nombre Completo,Username,Correo,FechaNacimiento,Contrasena\n" + 
  users.map(u => `${u.id},${u.fullName},${u.username},${u.email},${u.dob},${u.password}`).join('\n');

fs.writeFileSync('mock_users.csv', csvContent);

// Formatear en Markdown para el UI
const mdLines = [];
mdLines.push("| # | Nombre Completo | Username | Correo Electrónico | Fecha Nacimiento | Contraseña |");
mdLines.push("|---|---|---|---|---|---|");
users.forEach(u => {
  mdLines.push(`| ${u.id} | ${u.fullName} | @${u.username} | \`${u.email}\` | ${u.dob} | \`${u.password}\` |`);
});

fs.writeFileSync('mock_users.md', mdLines.join('\n'));
console.log("Generación exitosa");
