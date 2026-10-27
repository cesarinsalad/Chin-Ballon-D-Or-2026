import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "./index";
import { categories, members, nominees, settings } from "./schema";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    process.loadEnvFile();
  }
}

type MemberSeed = { name: string };
type MessageSeed = { author: string; text: string; at: string };
type PodiumSeed = { name: string; rank: number };

const MEMBER_SEEDS: MemberSeed[] = [
  { name: "César" },
  { name: "Carlos" },
  { name: "Fiume" },
  { name: "Gabriel" },
  { name: "Manuel" },
  { name: "Vargas" },
  { name: "Anfitrión" },
];

const CATEGORY_SEEDS = [
  {
    key: "olivada",
    title: "Olivada del Año",
    tagline: "Tiene que llamar a los cazafantasmas",
    kind: "ranked",
    position: 1,
    autoNominees: false,
    messages: [
      {
        author: "Autor 1",
        text: "Mensaje nominado 1 — edítame en el panel admin",
        at: "fecha 1",
      },
      {
        author: "Autor 2",
        text: "Mensaje nominado 2 — edítame en el panel admin",
        at: "fecha 2",
      },
      {
        author: "Autor 3",
        text: "Mensaje nominado 3 — edítame en el panel admin",
        at: "fecha 3",
      },
      {
        author: "Autor 4",
        text: "Mensaje nominado 4 — edítame en el panel admin",
        at: "fecha 4",
      },
    ],
  },
  {
    key: "puskas",
    title: "Puskas",
    tagline: "El mensaje más gracioso del año",
    kind: "ranked",
    position: 2,
    autoNominees: false,
    messages: [
      {
        author: "Autor 1",
        text: "Mensaje nominado 1 — edítame en el panel admin",
        at: "fecha 1",
      },
      {
        author: "Autor 2",
        text: "Mensaje nominado 2 — edítame en el panel admin",
        at: "fecha 2",
      },
      {
        author: "Autor 3",
        text: "Mensaje nominado 3 — edítame en el panel admin",
        at: "fecha 3",
      },
      {
        author: "Autor 4",
        text: "Mensaje nominado 4 — edítame en el panel admin",
        at: "fecha 4",
      },
    ],
  },
  {
    key: "mejor5",
    title: "Mejor 5 del Año",
    tagline: "Los cinco que forman el equipo ideal",
    kind: "pick5",
    position: 3,
    autoNominees: true,
    messages: [],
  },
  {
    key: "entrenadores",
    title: "Entrenadores del Año",
    tagline: "Los estrategas del OSM",
    kind: "ceremonial",
    position: 4,
    autoNominees: false,
    podium: [
      { name: "Carlos", rank: 1 },
      { name: "Manuel", rank: 2 },
      { name: "César", rank: 3 },
      { name: "Fiume", rank: 4 },
    ],
  },
  {
    key: "parley",
    title: "Mr Parley",
    tagline: "El podio incontestable del chinparley",
    kind: "ceremonial",
    position: 5,
    autoNominees: false,
    podium: [
      { name: "César", rank: 1 },
      { name: "Fiume", rank: 2 },
      { name: "Vargas", rank: 3 },
      { name: "Gabriel", rank: 4 },
      { name: "Anfitrión", rank: 5 },
    ],
  },
  {
    key: "balon",
    title: "Chin Ballon d'Or",
    tagline: "El premio más prestigioso del chinparley",
    kind: "ranked",
    position: 6,
    autoNominees: true,
    messages: [],
  },
] satisfies {
  key: string;
  title: string;
  tagline: string;
  kind: string;
  position: number;
  autoNominees: boolean;
  messages?: MessageSeed[];
  podium?: PodiumSeed[];
}[];

async function main() {
  const database = db();

  const settingsRow = (await database.select().from(settings).where(eq(settings.id, 1)))[0];
  if (!settingsRow) {
    await database.insert(settings).values({
      id: 1,
      groupCode: "CHIN2026",
      votingOpen: false,
      revealActive: false,
    });
    console.log("Settings creadas (código del grupo: CHIN2026).");
  }

  for (const member of MEMBER_SEEDS) {
    await database.insert(members).values({ name: member.name }).onConflictDoNothing();
  }
  const allMembers = await database.select().from(members);
  const memberByName = new Map(allMembers.map((m) => [m.name, m.id]));

  for (const category of CATEGORY_SEEDS) {
    const existing = (
      await database.select().from(categories).where(eq(categories.key, category.key))
    )[0];
    if (existing) continue;
    const inserted = await database
      .insert(categories)
      .values({
        key: category.key,
        title: category.title,
        tagline: category.tagline,
        kind: category.kind,
        position: category.position,
        autoNominees: category.autoNominees,
      })
      .returning();
    const categoryId = inserted[0].id;

    if (category.autoNominees) {
      await database.insert(nominees).values(
        allMembers.map((m, index) => ({
          categoryId,
          memberId: m.id,
          position: index,
        })),
      );
    } else if (category.messages) {
      await database.insert(nominees).values(
        category.messages.map((message, index) => ({
          categoryId,
          authorName: message.author,
          messageText: message.text,
          messageAt: message.at,
          position: index,
        })),
      );
    } else if (category.podium) {
      await database.insert(nominees).values(
        category.podium.map((podium) => ({
          categoryId,
          memberId: memberByName.get(podium.name),
          authorName: podium.name,
          rankPosition: podium.rank,
          position: podium.rank,
        })),
      );
    }
    console.log(`Categoría creada: ${category.title}.`);
  }

  for (const category of await database.select().from(categories)) {
    if (!category.autoNominees) continue;
    const existingNominees = await database
      .select()
      .from(nominees)
      .where(eq(nominees.categoryId, category.id));
    const existingMemberIds = new Set(
      existingNominees.map((n) => n.memberId).filter((id): id is number => id !== null),
    );
    const missing = allMembers.filter((m) => !existingMemberIds.has(m.id));
    if (missing.length > 0) {
      await database.insert(nominees).values(
        missing.map((m) => ({
          categoryId: category.id,
          memberId: m.id,
          position: existingNominees.length + missing.indexOf(m),
        })),
      );
    }
    const staleIds = existingNominees
      .filter((n) => n.memberId !== null && !allMembers.some((m) => m.id === n.memberId))
      .map((n) => n.id);
    if (staleIds.length > 0) {
      await database.delete(nominees).where(inArray(nominees.id, staleIds));
    }
  }

  const ballotCheck = await database
    .select({ id: nominees.id })
    .from(nominees)
    .where(and(isNotNull(nominees.messageText), isNotNull(nominees.authorName)));
  console.log(`Seed completo. Nominados de mensaje en BD: ${ballotCheck.length}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
