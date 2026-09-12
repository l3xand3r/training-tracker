// Extracted verbatim from page.tsx; course and queue behavior are unchanged.
const STORAGE_KEY = "training-tracker-v3";

type TabKey = "now" | "plan" | "weights" | "progress";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

type WorkoutSet = {
  reps: string;
  weight: number | null;
};

type ExerciseItem = {
  id: string;
  name: string;
  note: string;
  pair: string;
  sets: WorkoutSet[];
};

type SessionItem = {
  number: number;
  title: string;
  status: "active" | "rest";
  exercises: ExerciseItem[];
};

type WeekItem = {
  week: number;
  sessions: SessionItem[];
};

type FlatStep = {
  key: string;
  week: number;
  session: number;
  sessionTitle: string;
  exerciseId: string;
  exerciseName: string;
  note: string;
  pair: string;
  exerciseIndex: number;
  setIndex: number;
  reps: string;
  defaultWeight: number | null;
};

function exercise(
  name: string,
  sets: WorkoutSet[],
  options: Partial<ExerciseItem> = {}
): ExerciseItem {
  return {
    id: options.id || slugify(name),
    name,
    note: options.note || "",
    pair: options.pair || "",
    sets,
  };
}

function set(reps: string, weight: number | null = null): WorkoutSet {
  return { reps, weight };
}

const T1A = (
  b: WorkoutSet[],
  row: WorkoutSet[],
  rdl: WorkoutSet[],
  push: WorkoutSet[],
  row2: WorkoutSet[],
  shoulder: WorkoutSet[],
  tri: WorkoutSet[],
  absLast: WorkoutSet[],
  back: WorkoutSet[],
  options: { includeTriceps?: boolean; absNote?: string } = {}
): ExerciseItem[] => [
  exercise("Болгарский выпад", b, { note: "Одна гантель", pair: "Первая пара" }),
  exercise("Тяга гантели к низу живота", row, { pair: "Первая пара" }),
  exercise("Румынская", rdl, { pair: "Вторая пара" }),
  exercise("Отжимания", push, { pair: "Вторая пара" }),
  exercise("Тяга к груди", row2, {
    id: "tyaga-k-grudi",
    note: "Резинки или гантель, нагрузка подбирается индивидуально",
    pair: "Третья пара",
  }),
  exercise("Махи на плечи", shoulder, { pair: "Третья пара" }),
  ...(options.includeTriceps === false
    ? []
    : [exercise("Трицепс отжимания", tri, { pair: "Четвертая пара" })]),
  exercise("Пресс", absLast, {
    pair: "Четвертая пара",
    note: options.absNote || "Повторения с ? выполняются по самочувствию",
  }),
  exercise("Поясница", back, {
    id: "poyasnitsa",
    note: "Финальное упражнение на поясницу",
    pair: "Четвертая пара",
  }),
];

const T2A = (
  plie: WorkoutSet[],
  pullover: WorkoutSet[],
  split: WorkoutSet[],
  push: WorkoutSet[],
  press: WorkoutSet[],
  absLast: WorkoutSet[],
  back: WorkoutSet[],
  options: { pulloverNote?: string; splitNote?: string; absNote?: string } = {}
): ExerciseItem[] => [
  exercise("Присед плие", plie, { pair: "Первая пара" }),
  exercise("Пуловер", pullover, {
    pair: "Первая пара",
    note: options.pulloverNote || "Вес подбирается индивидуально",
  }),
  exercise("Сплит выпад / болгарский выпад", split, {
    id: "split-ili-bolgarskiy-vypad",
    pair: "Вторая пара",
    note: options.splitNote || "Если болгарские — с двумя гантелями",
  }),
  exercise("Отжимания", push, { pair: "Вторая пара" }),
  exercise("Жим на плечи", press, { pair: "Третья пара" }),
  exercise("Пресс", absLast, {
    pair: "Третья пара",
    note: options.absNote || "Повторения с ? выполняются по самочувствию",
  }),
  exercise("Поясница", back, {
    id: "poyasnitsa",
    note: "Финальное упражнение на поясницу",
    pair: "Третья пара",
  }),
];

const COURSE: WeekItem[] = [
  {
    week: 1,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("13", 5), set("13", 5), set("13", 5)],
          [set("12", 3), set("14", 6), set("14", 6), set("14", 6)],
          [set("12", 5), set("13", 10), set("13", 10), set("13", 10)],
          [set("5"), set("11"), set("12"), set("12")],
          [set("12", 5), set("12", 5)],
          [set("12", 2), set("10", 4), set("10", 4)],
          [set("5"), set("8")],
          [set("10"), set("?"), set("5")],
          [set("10", 0), set("12", 2), set("12", 2), set("12", 2)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("10", 12), set("10", 12), set("10", 12)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("13", 5), set("13", 5), set("13", 5)],
          [set("5"), set("11"), set("12"), set("12")],
          [set("12", 2), set("12", 4), set("12", 4)],
          [set("10"), set("?"), set("5")],
          [set("10", 0), set("12", 2), set("12", 2), set("12", 2)]
        ),
      },
    ],
  },
  {
    week: 2,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("15", 5), set("15", 5), set("15", 5)],
          [set("12", 3), set("15", 6), set("15", 6), set("15", 6)],
          [set("12", 5), set("15", 10), set("15", 10), set("15", 10)],
          [set("6"), set("12"), set("12"), set("12")],
          [set("12", 5), set("14", 5)],
          [set("12", 2), set("12", 4), set("12", 4)],
          [set("5"), set("10")],
          [set("10"), set("?"), set("6")],
          [set("10", 0), set("8", 3), set("8", 3), set("8", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("12", 12), set("12", 12), set("12", 12)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("15", 5), set("15", 5), set("15", 5)],
          [set("6"), set("12"), set("12"), set("12")],
          [set("12", 2), set("15", 4), set("15", 4)],
          [set("10"), set("?"), set("6")],
          [set("10", 0), set("8", 3), set("8", 3), set("8", 3)]
        ),
      },
    ],
  },
  {
    week: 3,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 7), set("12", 7), set("12", 7)],
          [set("12", 3), set("15", 6), set("15", 6), set("15", 6)],
          [set("12", 5), set("10", 10), set("10", 12), set("10", 12), set("10", 12)],
          [set("6"), set("12"), set("13"), set("13")],
          [set("12", 5), set("15", 5)],
          [set("12", 2), set("14", 4), set("14", 4)],
          [set("5"), set("12")],
          [set("10"), set("?"), set("7")],
          [set("10", 0), set("9", 3), set("9", 3), set("9", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("14", 12), set("14", 12), set("14", 12)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 7), set("12", 7), set("12", 7)],
          [set("6"), set("12"), set("13"), set("13")],
          [set("12", 2), set("12", 5), set("12", 5)],
          [set("10"), set("?"), set("7")],
          [set("10", 0), set("9", 3), set("9", 3), set("9", 3)]
        ),
      },
    ],
  },
  {
    week: 4,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("14", 7), set("14", 7), set("14", 7)],
          [set("12", 3), set("10", 8), set("10", 8), set("10", 8)],
          [set("12", 5), set("10", 10), set("12", 12), set("12", 12), set("12", 12)],
          [set("6"), set("12"), set("14"), set("14")],
          [set("12", 5), set("15", 5), set("15", 5)],
          [set("12", 2), set("15", 4), set("15", 4)],
          [set("5"), set("14")],
          [set("10"), set("?"), set("8")],
          [set("10", 0), set("10", 3), set("10", 3), set("10", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("10", 14), set("10", 14), set("10", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("14", 7), set("14", 7), set("14", 7)],
          [set("6"), set("12"), set("14"), set("14")],
          [set("12", 3), set("14", 5), set("14", 5)],
          [set("10"), set("?"), set("8")],
          [set("10", 0), set("10", 3), set("10", 3), set("10", 3)]
        ),
      },
    ],
  },
  {
    week: 5,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("10", 9), set("10", 9), set("10", 9)],
          [set("12", 3), set("12", 8), set("12", 8), set("12", 8)],
          [set("12", 5), set("10", 10), set("13", 12), set("13", 12), set("13", 12)],
          [set("6"), set("12"), set("15"), set("15")],
          [set("10", 5), set("10", 7), set("10", 7)],
          [set("12", 2), set("12", 5), set("12", 5)],
          [set("5"), set("15")],
          [set("10"), set("?"), set("9")],
          [set("10", 0), set("11", 3), set("11", 3), set("11", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("12", 14), set("12", 14), set("12", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("10", 9), set("10", 9), set("10", 9)],
          [set("6"), set("12"), set("15"), set("15")],
          [set("12", 3), set("11", 6), set("11", 6)],
          [set("10"), set("?"), set("9")],
          [set("10", 0), set("11", 3), set("11", 3), set("11", 3)]
        ),
      },
    ],
  },
  {
    week: 6,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("12", 3), set("14", 8), set("14", 8), set("14", 8)],
          [set("12", 5), set("10", 10), set("14", 12), set("14", 12), set("14", 12)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("10", 5), set("12", 7), set("12", 7)],
          [set("12", 2), set("13", 5), set("13", 5)],
          [set("7 с колен"), set("5 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("13", 14), set("13", 14), set("13", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("12", 3), set("13", 6), set("13", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)]
        ),
      },
    ],
  },
  {
    week: 7,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "rest",
        exercises: [],
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("9", 8), set("9", 8), set("9", 8)],
          [set("12", 3), set("12", 7), set("12", 7), set("12", 7)],
          [set("12", 5), set("10", 10), set("12", 10), set("12", 10)],
          [set("6"), set("12"), set("12"), set("12")],
          [set("10", 5), set("10", 6), set("10", 6)],
          [set("12", 2), set("13", 5), set("13", 5)],
          [],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)],
          { includeTriceps: false }
        ),
      },
    ],
  },
  {
    week: 8,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("13", 14), set("13", 14), set("13", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("12", 3), set("13", 6), set("13", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)],
          { pulloverNote: "Если с резинками никак — дублируйте тягу к груди из другой тренировки" }
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 9), set("12", 9), set("12", 9)],
          [set("12", 3), set("14", 8), set("14", 8), set("14", 8)],
          [set("12", 5), set("10", 10), set("14", 12), set("14", 12), set("14", 12)],
          [set("6"), set("13"), set("15"), set("15")],
          [set("10", 5), set("12", 7), set("12", 7)],
          [set("12", 2), set("13", 5), set("13", 5)],
          [set("7 с колен"), set("5 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("12", 3), set("12", 3), set("12", 3)]
        ),
      },
    ],
  },
  {
    week: 9,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 9), set("15", 14), set("15", 14), set("15", 14)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("14", 9), set("14", 9), set("14", 9)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("3 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("9", 4), set("9", 4), set("9", 4)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("14", 9), set("14", 9), set("14", 9)],
          [set("12", 3), set("15", 8), set("15", 8), set("15", 8)],
          [set("12", 5), set("10", 10), set("10", 14), set("10", 14), set("10", 14)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("3 с прямых")],
          [set("10", 5), set("14", 7), set("14", 7)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("6 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("9", 4), set("9", 4), set("9", 4)]
        ),
      },
    ],
  },
  {
    week: 10,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 10), set("10", 16), set("10", 16), set("10", 16)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("10", 10), set("10", 10), set("10", 10)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("5 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("10", 4), set("10", 4), set("10", 4)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("10", 10), set("10", 10), set("10", 10)],
          [set("12", 4), set("11", 9), set("11", 9), set("11", 9)],
          [set("12", 5), set("10", 10), set("12", 14), set("12", 14), set("12", 14)],
          [set("6 с колен"), set("5 с прямых"), set("5 с прямых"), set("5 с прямых")],
          [set("10", 5), set("15", 7), set("15", 7)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("7 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("10", 4), set("10", 4), set("10", 4)]
        ),
      },
    ],
  },
  {
    week: 11,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 10), set("10", 16), set("12", 16), set("12", 16)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("10", 10), set("12", 10), set("12", 10)],
          [set("6 с колен"), set("5 с прямых"), set("6 с прямых"), set("6 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("11", 4), set("11", 4), set("11", 4)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("12", 10), set("12", 10), set("12", 10)],
          [set("12", 4), set("12", 9), set("12", 9), set("12", 9)],
          [set("12", 5), set("10", 10), set("12", 14), set("14", 14), set("14", 14)],
          [set("6 с колен"), set("5 с прямых"), set("6 с прямых"), set("6 с прямых")],
          [set("10", 5), set("12", 8), set("12", 8)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("8 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("11", 4), set("11", 4), set("11", 4)]
        ),
      },
    ],
  },
  {
    week: 12,
    sessions: [
      {
        number: 1,
        title: "Тренировка 1",
        status: "active",
        exercises: T2A(
          [set("12", 5), set("8", 10), set("12", 16), set("13", 16), set("13", 16)],
          [set("12", null), set("12", null), set("12", null), set("12", null)],
          [set("12", 0), set("10", 5), set("12", 10), set("13", 10), set("13", 10)],
          [set("6 с колен"), set("6 с прямых"), set("7 с прямых"), set("6 с прямых")],
          [set("12", 3), set("15", 6), set("15", 6)],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("8", 5), set("8", 5), set("8", 5)]
        ),
      },
      {
        number: 2,
        title: "Тренировка 2",
        status: "active",
        exercises: T1A(
          [set("12", 0), set("10", 5), set("13", 10), set("14", 10), set("14", 10)],
          [set("12", 4), set("13", 9), set("13", 9), set("13", 9)],
          [set("12", 5), set("10", 10), set("10", 16), set("10", 16), set("10", 16)],
          [set("6 с колен"), set("6 с прямых"), set("7 с прямых"), set("6 с прямых")],
          [set("10", 5), set("13", 8), set("13", 8)],
          [set("12", 2), set("15", 5), set("15", 5)],
          [set("7 с колен"), set("9 с прямых")],
          [set("10"), set("?"), set("10")],
          [set("10", 0), set("8", 5), set("8", 5), set("8", 5)]
        ),
      },
    ],
  },
];

function buildFlatCourse(course: WeekItem[]): FlatStep[] {
  const items: FlatStep[] = [];

  course.forEach((week) => {
    week.sessions.forEach((session) => {
      if (session.status !== "active") return;

      const pairOrder: string[] = [];
      const pairMap = new Map<string, ExerciseItem[]>();

      session.exercises.forEach((ex) => {
        const pairKey = ex.pair || "Без пары";
        if (!pairMap.has(pairKey)) {
          pairMap.set(pairKey, []);
          pairOrder.push(pairKey);
        }
        pairMap.get(pairKey)!.push(ex);
      });

      pairOrder.forEach((pairKey) => {
        const pairExercises = pairMap.get(pairKey) || [];
        const maxSets = Math.max(...pairExercises.map((ex) => ex.sets.length), 0);

        for (let setIndex = 0; setIndex < maxSets; setIndex += 1) {
          pairExercises.forEach((ex, exerciseIndexInPair) => {
            const workSet = ex.sets[setIndex];
            if (!workSet) return;

            const exerciseIndexInSession = session.exercises.findIndex(
              (sessionExercise) => sessionExercise.id === ex.id
            );

            items.push({
              key: `${week.week}-${session.number}-${ex.id}-${setIndex}`,
              week: week.week,
              session: session.number,
              sessionTitle: session.title,
              exerciseId: ex.id,
              exerciseName: ex.name,
              note: ex.note,
              pair: pairKey,
              exerciseIndex:
                exerciseIndexInSession >= 0 ? exerciseIndexInSession : exerciseIndexInPair,
              setIndex,
              reps: workSet.reps,
              defaultWeight: workSet.weight,
            });
          });
        }
      });
    });
  });

  return items;
}

function getExerciseInstances(course: WeekItem[]) {
  const map: Record<string, { id: string; name: string; sets: WorkoutSet[] }> = {};
  course.forEach((week) => {
    week.sessions.forEach((session) => {
      if (session.status !== "active") return;
      session.exercises.forEach((ex) => {
        if (!map[ex.id]) map[ex.id] = { id: ex.id, name: ex.name, sets: [] };
        ex.sets.forEach((s, idx) => {
          if (!map[ex.id].sets[idx]) {
            map[ex.id].sets[idx] = { reps: s.reps, weight: s.weight };
          }
        });
      });
    });
  });
  return Object.values(map);
}

function getNextAvailableStep(flat: FlatStep[], doneSet: Set<string>, preferredIndex = 0) {
  for (let i = preferredIndex; i < flat.length; i += 1) {
    if (!doneSet.has(flat[i].key)) return i;
  }
  for (let i = 0; i < preferredIndex; i += 1) {
    if (!doneSet.has(flat[i].key)) return i;
  }
  return flat.length;
}

function formatWeight(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : `${value} кг`;
}

function getSessionLabel(week: number, session: number) {
  return `Неделя ${week} · Тренировка ${session}`;
}

function getWorkoutKey(week: number, session: number) {
  return `${week}-${session}`;
}


export { STORAGE_KEY, COURSE, buildFlatCourse, getExerciseInstances, getNextAvailableStep, formatWeight, getSessionLabel, getWorkoutKey };
export type { TabKey, WorkoutSet, ExerciseItem, SessionItem, WeekItem, FlatStep };
