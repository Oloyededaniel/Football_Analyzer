/**
 * Bench / depth players to expand squads beyond a starting XI.
 * Merged into REAL_SQUADS / REAL_NATIONAL_SQUADS during sync.
 */

import type { RealPlayerSeed } from "./realPlayers.js";

export const CLUB_BENCH: Record<string, RealPlayerSeed[]> = {
  Liverpool: [
    { name: "Giorgi Mamardashvili", position: "GK", age: 24, nationality: "Georgia" },
    { name: "Joe Gomez", position: "DEF", age: 27, nationality: "England" },
    { name: "Jarell Quansah", position: "DEF", age: 22, nationality: "England" },
    { name: "Kostas Tsimikas", position: "DEF", age: 28, nationality: "Greece" },
    { name: "Conor Bradley", position: "DEF", age: 21, nationality: "Northern Ireland" },
    { name: "Wataru Endo", position: "MID", age: 32, nationality: "Japan" },
    { name: "Harvey Elliott", position: "MID", age: 22, nationality: "England" },
    { name: "Federico Chiesa", position: "FWD", age: 27, nationality: "Italy" },
    { name: "Diego Jota", position: "FWD", age: 29, nationality: "Portugal" },
  ],
  Arsenal: [
    { name: "Neto", position: "GK", age: 35, nationality: "Brazil" },
    { name: "Oleksandr Zinchenko", position: "DEF", age: 28, nationality: "Ukraine" },
    { name: "Takehiro Tomiyasu", position: "DEF", age: 26, nationality: "Japan" },
    { name: "Jakub Kiwior", position: "DEF", age: 24, nationality: "Poland" },
    { name: "Jorginho", position: "MID", age: 33, nationality: "Italy" },
    { name: "Mikel Merino", position: "MID", age: 28, nationality: "Spain" },
    { name: "Emile Smith Rowe", position: "MID", age: 24, nationality: "England" },
    { name: "Gabriel Jesus", position: "FWD", age: 28, nationality: "Brazil" },
    { name: "Raheem Sterling", position: "FWD", age: 30, nationality: "England" },
  ],
  "Manchester City": [
    { name: "Stefan Ortega", position: "GK", age: 32, nationality: "Germany" },
    { name: "Nathan Aké", position: "DEF", age: 30, nationality: "Netherlands" },
    { name: "Manuel Akanji", position: "DEF", age: 29, nationality: "Switzerland" },
    { name: "Rico Lewis", position: "DEF", age: 20, nationality: "England" },
    { name: "Mateo Kovačić", position: "MID", age: 31, nationality: "Croatia" },
    { name: "İlkay Gündoğan", position: "MID", age: 34, nationality: "Germany" },
    { name: "Savinho", position: "FWD", age: 21, nationality: "Brazil" },
    { name: "Jack Grealish", position: "FWD", age: 29, nationality: "England" },
    { name: "Julián Álvarez", position: "FWD", age: 25, nationality: "Argentina" },
  ],
  "Manchester United": [
    { name: "Altay Bayındır", position: "GK", age: 26, nationality: "Türkiye" },
    { name: "Luke Shaw", position: "DEF", age: 29, nationality: "England" },
    { name: "Leny Yoro", position: "DEF", age: 19, nationality: "France" },
    { name: "Matthijs de Ligt", position: "DEF", age: 25, nationality: "Netherlands" },
    { name: "Manuel Ugarte", position: "MID", age: 24, nationality: "Uruguay" },
    { name: "Christian Eriksen", position: "MID", age: 33, nationality: "Denmark" },
    { name: "Mason Mount", position: "MID", age: 26, nationality: "England" },
    { name: "Joshua Zirkzee", position: "FWD", age: 23, nationality: "Netherlands" },
    { name: "Antony", position: "FWD", age: 25, nationality: "Brazil" },
  ],
  Chelsea: [
    { name: "Filip Jörgensen", position: "GK", age: 22, nationality: "Denmark" },
    { name: "Benoît Badiashile", position: "DEF", age: 23, nationality: "France" },
    { name: "Tosin Adarabioyo", position: "DEF", age: 27, nationality: "England" },
    { name: "Malo Gusto", position: "DEF", age: 22, nationality: "France" },
    { name: "Romeo Lavia", position: "MID", age: 21, nationality: "Belgium" },
    { name: "Christopher Nkunku", position: "FWD", age: 27, nationality: "France" },
    { name: "Mykhailo Mudryk", position: "FWD", age: 24, nationality: "Ukraine" },
    { name: "João Félix", position: "FWD", age: 25, nationality: "Portugal" },
  ],
  "Tottenham Hotspur": [
    { name: "Fraser Forster", position: "GK", age: 37, nationality: "England" },
    { name: "Radu Drăgușin", position: "DEF", age: 23, nationality: "Romania" },
    { name: "Djed Spence", position: "DEF", age: 24, nationality: "England" },
    { name: "Pape Matar Sarr", position: "MID", age: 22, nationality: "Senegal" },
    { name: "Lucas Bergvall", position: "MID", age: 19, nationality: "Sweden" },
    { name: "Wilson Odobert", position: "FWD", age: 20, nationality: "France" },
    { name: "Richarlison", position: "FWD", age: 27, nationality: "Brazil" },
  ],
  "Real Madrid": [
    { name: "Andriy Lunin", position: "GK", age: 26, nationality: "Ukraine" },
    { name: "David Alaba", position: "DEF", age: 32, nationality: "Austria" },
    { name: "Fran García", position: "DEF", age: 25, nationality: "Spain" },
    { name: "Antonio Rüdiger", position: "DEF", age: 32, nationality: "Germany" },
    { name: "Eduardo Camavinga", position: "MID", age: 22, nationality: "France" },
    { name: "Arda Güler", position: "MID", age: 20, nationality: "Türkiye" },
    { name: "Brahim Díaz", position: "FWD", age: 25, nationality: "Morocco" },
    { name: "Joselu", position: "FWD", age: 34, nationality: "Spain" },
  ],
  Barcelona: [
    { name: "Iñaki Peña", position: "GK", age: 25, nationality: "Spain" },
    { name: "Andreas Christensen", position: "DEF", age: 28, nationality: "Denmark" },
    { name: "Héctor Fort", position: "DEF", age: 18, nationality: "Spain" },
    { name: "Marc Casadó", position: "MID", age: 21, nationality: "Spain" },
    { name: "Fermín López", position: "MID", age: 21, nationality: "Spain" },
    { name: "Dani Olmo", position: "MID", age: 26, nationality: "Spain" },
    { name: "Ansu Fati", position: "FWD", age: 22, nationality: "Spain" },
    { name: "Pau Víctor", position: "FWD", age: 23, nationality: "Spain" },
  ],
  "Bayern Munich": [
    { name: "Sven Ulreich", position: "GK", age: 36, nationality: "Germany" },
    { name: "Eric Dier", position: "DEF", age: 31, nationality: "England" },
    { name: "Raphaël Guerreiro", position: "DEF", age: 31, nationality: "Portugal" },
    { name: "Konrad Laimer", position: "MID", age: 28, nationality: "Austria" },
    { name: "Leon Goretzka", position: "MID", age: 30, nationality: "Germany" },
    { name: "Thomas Müller", position: "FWD", age: 35, nationality: "Germany" },
    { name: "Mathys Tel", position: "FWD", age: 19, nationality: "France" },
  ],
  "Paris Saint-Germain": [
    { name: "Matvey Safonov", position: "GK", age: 25, nationality: "Russia" },
    { name: "Lucas Hernández", position: "DEF", age: 28, nationality: "France" },
    { name: "Presnel Kimpembe", position: "DEF", age: 29, nationality: "France" },
    { name: "Warren Zaïre-Emery", position: "MID", age: 18, nationality: "France" },
    { name: "Lee Kang-in", position: "MID", age: 24, nationality: "South Korea" },
    { name: "Gonçalo Ramos", position: "FWD", age: 24, nationality: "Portugal" },
    { name: "Bradley Barcola", position: "FWD", age: 22, nationality: "France" },
  ],
  "Inter Milan": [
    { name: "Raffaele Di Gennaro", position: "GK", age: 31, nationality: "Italy" },
    { name: "Benjamin Pavard", position: "DEF", age: 28, nationality: "France" },
    { name: "Carlos Augusto", position: "DEF", age: 25, nationality: "Brazil" },
    { name: "Davide Frattesi", position: "MID", age: 25, nationality: "Italy" },
    { name: "Piotr Zieliński", position: "MID", age: 31, nationality: "Poland" },
    { name: "Marko Arnautović", position: "FWD", age: 36, nationality: "Austria" },
  ],
  "AC Milan": [
    { name: "Marco Sportiello", position: "GK", age: 32, nationality: "Italy" },
    { name: "Strahinja Pavlović", position: "DEF", age: 24, nationality: "Serbia" },
    { name: "Davide Calabria", position: "DEF", age: 28, nationality: "Italy" },
    { name: "Youssouf Fofana", position: "MID", age: 25, nationality: "France" },
    { name: "Tammy Abraham", position: "FWD", age: 27, nationality: "England" },
    { name: "Álvaro Morata", position: "FWD", age: 32, nationality: "Spain" },
  ],
  "Borussia Dortmund": [
    { name: "Alexander Meyer", position: "GK", age: 33, nationality: "Germany" },
    { name: "Niklas Süle", position: "DEF", age: 29, nationality: "Germany" },
    { name: "Julian Ryerson", position: "DEF", age: 27, nationality: "Norway" },
    { name: "Pascal Groß", position: "MID", age: 33, nationality: "Germany" },
    { name: "Maximilian Beier", position: "FWD", age: 22, nationality: "Germany" },
  ],
  "Atlético Madrid": [
    { name: "Juan Musso", position: "GK", age: 30, nationality: "Argentina" },
    { name: "César Azpilicueta", position: "DEF", age: 35, nationality: "Spain" },
    { name: "Marcos Llorente", position: "MID", age: 29, nationality: "Spain" },
    { name: "Conor Gallagher", position: "MID", age: 24, nationality: "England" },
    { name: "Ángel Correa", position: "FWD", age: 29, nationality: "Argentina" },
  ],
  Napoli: [
    { name: "Nikita Contini", position: "GK", age: 28, nationality: "Italy" },
    { name: "Alessandro Buongiorno", position: "DEF", age: 25, nationality: "Italy" },
    { name: "Mathías Olivera", position: "DEF", age: 27, nationality: "Uruguay" },
    { name: "Billy Gilmour", position: "MID", age: 23, nationality: "Scotland" },
    { name: "Giacomo Raspadori", position: "FWD", age: 25, nationality: "Italy" },
  ],
  Juventus: [
    { name: "Mattia Perin", position: "GK", age: 32, nationality: "Italy" },
    { name: "Danilo", position: "DEF", age: 34, nationality: "Brazil" },
    { name: "Andrea Cambiaso", position: "DEF", age: 24, nationality: "Italy" },
    { name: "Teun Koopmeiners", position: "MID", age: 26, nationality: "Netherlands" },
    { name: "Francisco Conceição", position: "FWD", age: 22, nationality: "Portugal" },
  ],
  "Newcastle United": [
    { name: "Martin Dúbravka", position: "GK", age: 36, nationality: "Slovakia" },
    { name: "Dan Burn", position: "DEF", age: 32, nationality: "England" },
    { name: "Tino Livramento", position: "DEF", age: 22, nationality: "England" },
    { name: "Sandro Tonali", position: "MID", age: 24, nationality: "Italy" },
    { name: "Harvey Barnes", position: "FWD", age: 27, nationality: "England" },
    { name: "Callum Wilson", position: "FWD", age: 33, nationality: "England" },
  ],
  "Aston Villa": [
    { name: "Robin Olsen", position: "GK", age: 35, nationality: "Sweden" },
    { name: "Diego Carlos", position: "DEF", age: 31, nationality: "Brazil" },
    { name: "Lucas Digne", position: "DEF", age: 31, nationality: "France" },
    { name: "John McGinn", position: "MID", age: 30, nationality: "Scotland" },
    { name: "Leon Bailey", position: "FWD", age: 27, nationality: "Jamaica" },
    { name: "Jhon Durán", position: "FWD", age: 21, nationality: "Colombia" },
  ],
};

export const NATIONAL_BENCH: Record<string, RealPlayerSeed[]> = {
  Argentina: [
    { name: "Gerónimo Rulli", position: "GK", age: 33, nationality: "Argentina" },
    { name: "Gonzalo Montiel", position: "DEF", age: 28, nationality: "Argentina" },
    { name: "Nicolás Tagliafico", position: "DEF", age: 32, nationality: "Argentina" },
    { name: "Leandro Paredes", position: "MID", age: 30, nationality: "Argentina" },
    { name: "Exequiel Palacios", position: "MID", age: 26, nationality: "Argentina" },
    { name: "Nicolás González", position: "FWD", age: 27, nationality: "Argentina" },
    { name: "Paulo Dybala", position: "FWD", age: 31, nationality: "Argentina" },
  ],
  Spain: [
    { name: "David Raya", position: "GK", age: 30, nationality: "Spain" },
    { name: "Pau Cubarsí", position: "DEF", age: 18, nationality: "Spain" },
    { name: "Dani Vivian", position: "DEF", age: 25, nationality: "Spain" },
    { name: "Mikel Merino", position: "MID", age: 28, nationality: "Spain" },
    { name: "Dani Olmo", position: "MID", age: 26, nationality: "Spain" },
    { name: "Joselu", position: "FWD", age: 34, nationality: "Spain" },
    { name: "Oyarzabal", position: "FWD", age: 28, nationality: "Spain" },
  ],
  France: [
    { name: "Brice Samba", position: "GK", age: 31, nationality: "France" },
    { name: "Ibrahima Konaté", position: "DEF", age: 26, nationality: "France" },
    { name: "Lucas Hernández", position: "DEF", age: 28, nationality: "France" },
    { name: "Adrien Rabiot", position: "MID", age: 30, nationality: "France" },
    { name: "Warren Zaïre-Emery", position: "MID", age: 18, nationality: "France" },
    { name: "Marcus Thuram", position: "FWD", age: 27, nationality: "France" },
    { name: "Bradley Barcola", position: "FWD", age: 22, nationality: "France" },
  ],
  England: [
    { name: "Dean Henderson", position: "GK", age: 28, nationality: "England" },
    { name: "Ezri Konsa", position: "DEF", age: 27, nationality: "England" },
    { name: "Rico Lewis", position: "DEF", age: 20, nationality: "England" },
    { name: "Conor Gallagher", position: "MID", age: 24, nationality: "England" },
    { name: "Kobbie Mainoo", position: "MID", age: 20, nationality: "England" },
    { name: "Ollie Watkins", position: "FWD", age: 29, nationality: "England" },
    { name: "Jarrod Bowen", position: "FWD", age: 28, nationality: "England" },
  ],
  Portugal: [
    { name: "José Sá", position: "GK", age: 32, nationality: "Portugal" },
    { name: "António Silva", position: "DEF", age: 21, nationality: "Portugal" },
    { name: "Nuno Mendes", position: "DEF", age: 23, nationality: "Portugal" },
    { name: "Otávio", position: "MID", age: 29, nationality: "Portugal" },
    { name: "Pedro Neto", position: "FWD", age: 25, nationality: "Portugal" },
    { name: "Diogo Jota", position: "FWD", age: 29, nationality: "Portugal" },
  ],
  Brazil: [
    { name: "Bento", position: "GK", age: 25, nationality: "Brazil" },
    { name: "Gabriel Magalhães", position: "DEF", age: 27, nationality: "Brazil" },
    { name: "Bremer", position: "DEF", age: 28, nationality: "Brazil" },
    { name: "Andreas Pereira", position: "MID", age: 29, nationality: "Brazil" },
    { name: "Savinho", position: "FWD", age: 21, nationality: "Brazil" },
    { name: "Gabriel Martinelli", position: "FWD", age: 24, nationality: "Brazil" },
  ],
  Germany: [
    { name: "Marc-André ter Stegen", position: "GK", age: 32, nationality: "Germany" },
    { name: "Nico Schlotterbeck", position: "DEF", age: 25, nationality: "Germany" },
    { name: "David Raum", position: "DEF", age: 26, nationality: "Germany" },
    { name: "Pascal Groß", position: "MID", age: 33, nationality: "Germany" },
    { name: "Deniz Undav", position: "FWD", age: 28, nationality: "Germany" },
    { name: "Maximilian Beier", position: "FWD", age: 22, nationality: "Germany" },
  ],
  Netherlands: [
    { name: "Justin Bijlow", position: "GK", age: 26, nationality: "Netherlands" },
    { name: "Jurriën Timber", position: "DEF", age: 24, nationality: "Netherlands" },
    { name: "Jericho Malacia", position: "DEF", age: 25, nationality: "Netherlands" },
    { name: "Ryan Gravenberch", position: "MID", age: 23, nationality: "Netherlands" },
    { name: "Brian Brobbey", position: "FWD", age: 23, nationality: "Netherlands" },
  ],
  Belgium: [
    { name: "Matz Sels", position: "GK", age: 33, nationality: "Belgium" },
    { name: "Zeno Debast", position: "DEF", age: 21, nationality: "Belgium" },
    { name: "Arthur Vermeeren", position: "MID", age: 20, nationality: "Belgium" },
    { name: "Leandro Trossard", position: "FWD", age: 30, nationality: "Belgium" },
    { name: "Dodi Lukebakio", position: "FWD", age: 27, nationality: "Belgium" },
  ],
  Italy: [
    { name: "Guglielmo Vicario", position: "GK", age: 28, nationality: "Italy" },
    { name: "Riccardo Calafiori", position: "DEF", age: 22, nationality: "Italy" },
    { name: "Destiny Udogie", position: "DEF", age: 22, nationality: "Italy" },
    { name: "Davide Frattesi", position: "MID", age: 25, nationality: "Italy" },
    { name: "Gianluca Scamacca", position: "FWD", age: 26, nationality: "Italy" },
  ],
  USA: [
    { name: "Zack Steffen", position: "GK", age: 30, nationality: "USA" },
    { name: "Chris Richards", position: "DEF", age: 25, nationality: "USA" },
    { name: "Antonee Robinson", position: "DEF", age: 27, nationality: "USA" },
    { name: "Yunus Musah", position: "MID", age: 22, nationality: "USA" },
    { name: "Josh Sargent", position: "FWD", age: 25, nationality: "USA" },
  ],
  Morocco: [
    { name: "Munir Mohamedi", position: "GK", age: 35, nationality: "Morocco" },
    { name: "Noussair Mazraoui", position: "DEF", age: 27, nationality: "Morocco" },
    { name: "Abdelhamid Sabiri", position: "MID", age: 28, nationality: "Morocco" },
    { name: "Abde Ezzalzouli", position: "FWD", age: 23, nationality: "Morocco" },
  ],
  Japan: [
    { name: "Daiya Maekawa", position: "GK", age: 29, nationality: "Japan" },
    { name: "Ko Itakura", position: "DEF", age: 27, nationality: "Japan" },
    { name: "Ao Tanaka", position: "MID", age: 26, nationality: "Japan" },
    { name: "Takefusa Kubo", position: "FWD", age: 24, nationality: "Japan" },
  ],
  Senegal: [
    { name: "Mory Diaw", position: "GK", age: 31, nationality: "Senegal" },
    { name: "Abdou Diallo", position: "DEF", age: 28, nationality: "Senegal" },
    { name: "Pape Matar Sarr", position: "MID", age: 22, nationality: "Senegal" },
    { name: "Boulaye Dia", position: "FWD", age: 28, nationality: "Senegal" },
  ],
  Nigeria: [
    { name: "Maduka Okoye", position: "GK", age: 25, nationality: "Nigeria" },
    { name: "Calvin Bassey", position: "DEF", age: 25, nationality: "Nigeria" },
    { name: "Alex Iwobi", position: "MID", age: 28, nationality: "Nigeria" },
    { name: "Victor Boniface", position: "FWD", age: 24, nationality: "Nigeria" },
  ],
  Mexico: [
    { name: "Carlos Acevedo", position: "GK", age: 31, nationality: "Mexico" },
    { name: "César Montes", position: "DEF", age: 28, nationality: "Mexico" },
    { name: "Luis Chávez", position: "MID", age: 29, nationality: "Mexico" },
    { name: "Julián Quiñones", position: "FWD", age: 27, nationality: "Mexico" },
  ],
  Uruguay: [
    { name: "Santiago Mele", position: "GK", age: 27, nationality: "Uruguay" },
    { name: "Mathías Olivera", position: "DEF", age: 27, nationality: "Uruguay" },
    { name: "Facundo Pellistri", position: "FWD", age: 23, nationality: "Uruguay" },
    { name: "Brian Rodríguez", position: "FWD", age: 24, nationality: "Uruguay" },
  ],
  Colombia: [
    { name: "Álvaro Montero", position: "GK", age: 29, nationality: "Colombia" },
    { name: "Yerry Mina", position: "DEF", age: 30, nationality: "Colombia" },
    { name: "Jorge Carrascal", position: "MID", age: 26, nationality: "Colombia" },
    { name: "Rafael Santos Borré", position: "FWD", age: 29, nationality: "Colombia" },
  ],
  Croatia: [
    { name: "Ivica Ivušić", position: "GK", age: 29, nationality: "Croatia" },
    { name: "Josip Juranović", position: "DEF", age: 29, nationality: "Croatia" },
    { name: "Lovro Majer", position: "MID", age: 26, nationality: "Croatia" },
    { name: "Bruno Petković", position: "FWD", age: 30, nationality: "Croatia" },
  ],
  Switzerland: [
    { name: "Gregor Kobel", position: "GK", age: 27, nationality: "Switzerland" },
    { name: "Nico Elvedi", position: "DEF", age: 28, nationality: "Switzerland" },
    { name: "Michel Aebischer", position: "MID", age: 28, nationality: "Switzerland" },
    { name: "Zeki Amdouni", position: "FWD", age: 24, nationality: "Switzerland" },
  ],
};

function mergeUnique(
  base: RealPlayerSeed[] | undefined,
  extra: RealPlayerSeed[] | undefined
): RealPlayerSeed[] {
  const out = [...(base ?? [])];
  const names = new Set(out.map((p) => p.name.toLowerCase()));
  for (const p of extra ?? []) {
    if (names.has(p.name.toLowerCase())) continue;
    out.push(p);
    names.add(p.name.toLowerCase());
  }
  return out;
}

export function fullClubSquad(name: string, base?: RealPlayerSeed[]): RealPlayerSeed[] {
  return mergeUnique(base, CLUB_BENCH[name]);
}

export function fullNationalSquad(name: string, base?: RealPlayerSeed[]): RealPlayerSeed[] {
  return mergeUnique(base, NATIONAL_BENCH[name]);
}
