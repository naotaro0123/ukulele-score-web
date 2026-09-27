import { useCallback, useEffect, useRef, useState } from 'react';

type Chord = 'C' | 'G' | 'Am' | 'F';
type Judgement = 'Great' | 'Good' | 'Miss';

type Note = {
  time: number;
  chord: Chord;
};

type GameNote = Note & {
  id: number;
  status: 'waiting' | 'great' | 'good' | 'miss';
};

const CHART: Note[] = [
  { time: 2, chord: 'C' },
  { time: 3, chord: 'G' },
  { time: 4, chord: 'Am' },
  { time: 5, chord: 'F' },
  { time: 6.5, chord: 'C' },
  { time: 7.5, chord: 'G' },
  { time: 8.5, chord: 'F' },
  { time: 9.5, chord: 'G' },
  { time: 11, chord: 'C' },
  { time: 12, chord: 'G' },
  { time: 13, chord: 'Am' },
  { time: 14, chord: 'F' },
  { time: 15.5, chord: 'Am' },
  { time: 16.5, chord: 'G' },
  { time: 17.5, chord: 'F' },
  { time: 18.5, chord: 'C' },
];

const KEY_TO_CHORD: Record<string, Chord> = {
  c: 'C',
  g: 'G',
  a: 'Am',
  f: 'F',
};

const TRAVEL_TIME = 4;
const GREAT_WINDOW = 0.16;
const GOOD_WINDOW = 0.32;
const MISS_WINDOW = 0.38;

const createNotes = (): GameNote[] =>
  CHART.map((note, id) => ({ ...note, id, status: 'waiting' }));

const App = () => {
  const [notes, setNotes] = useState<GameNote[]>(createNotes);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [judgement, setJudgement] = useState<Judgement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const notesRef = useRef(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const updateNote = useCallback(
    (id: number, status: GameNote['status']) => {
      setNotes((current) =>
        current.map((note) => (note.id === id ? { ...note, status } : note)),
      );
    },
    [],
  );

  const registerMiss = useCallback(
    (note: GameNote) => {
      updateNote(note.id, 'miss');
      setCombo(0);
      setJudgement('Miss');
    },
    [updateNote],
  );

  useEffect(() => {
    if (!isPlaying) return;

    const tick = (now: number) => {
      const currentElapsed = (now - startTimeRef.current) / 1000;
      elapsedRef.current = currentElapsed;
      setElapsed(currentElapsed);

      const missedNotes = notesRef.current.filter(
        (note) =>
          note.status === 'waiting' &&
          currentElapsed - note.time > MISS_WINDOW,
      );
      missedNotes.forEach(registerMiss);

      const finalTime = CHART[CHART.length - 1].time + 1;
      if (currentElapsed >= finalTime) {
        setIsPlaying(false);
        setIsFinished(true);
        return;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, registerMiss]);

  const handleChord = useCallback(
    (chord: Chord) => {
      if (!isPlaying) return;

      const currentElapsed = elapsedRef.current;
      const candidates = notesRef.current
        .filter((note) => note.status === 'waiting' && note.chord === chord)
        .map((note) => ({
          note,
          difference: Math.abs(note.time - currentElapsed),
        }))
        .sort((a, b) => a.difference - b.difference);

      const target = candidates[0];
      if (!target || target.difference > GOOD_WINDOW) {
        setCombo(0);
        setJudgement('Miss');
        return;
      }

      const isGreat = target.difference <= GREAT_WINDOW;
      const result = isGreat ? 'Great' : 'Good';
      updateNote(target.note.id, isGreat ? 'great' : 'good');
      setScore((current) => current + (isGreat ? 1000 : 500));
      setCombo((current) => current + 1);
      setJudgement(result);
    },
    [isPlaying, updateNote],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const chord = KEY_TO_CHORD[event.key.toLowerCase()];
      if (chord) handleChord(chord);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleChord]);

  const startGame = () => {
    setNotes(createNotes());
    setElapsed(0);
    elapsedRef.current = 0;
    setScore(0);
    setCombo(0);
    setJudgement(null);
    setIsFinished(false);
    startTimeRef.current = performance.now();
    setIsPlaying(true);
  };

  const progress = Math.min(
    elapsed / (CHART[CHART.length - 1].time + 1),
    1,
  );

  return (
    <main className="game-shell">
      <header className="masthead">
        <div className="brand">
          <span className="brand-mark">U</span>
          <div>
            <p>Ukulele Score Web</p>
            <h1>マリーゴールド</h1>
          </div>
        </div>
        <div className="difficulty">
          <span>EASY</span>
          <i />
          <i />
          <i />
          <i className="muted" />
          <i className="muted" />
        </div>
      </header>

      <section className="scoreboard" aria-label="プレイ状況">
        <div className="stat">
          <span>SCORE</span>
          <strong>{score.toString().padStart(6, '0')}</strong>
        </div>
        <div className="stat combo">
          <span>COMBO</span>
          <strong>{combo}</strong>
        </div>
        <div className="judgement">
          <span>JUDGEMENT</span>
          <strong className={judgement?.toLowerCase() ?? ''}>
            {judgement ?? 'READY'}
          </strong>
        </div>
      </section>

      <section className="stage">
        <div className="stage-heading">
          <div>
            <span className="eyebrow">CHORUS</span>
            <h2>リズムに合わせてコードを弾こう</h2>
          </div>
          <span className="bpm">♩ = 100 BPM</span>
        </div>

        <div className="lane" aria-label="コードレーン">
          <div className="lane-lines" />
          <div className="hit-zone">
            <span>HIT!</span>
          </div>
          {notes.map((note) => {
            const position = 50 + ((note.time - elapsed) / TRAVEL_TIME) * 50;
            const isVisible = position > -12 && position < 112;
            return (
              <div
                className={`note note-${note.chord.toLowerCase()} ${note.status}`}
                key={note.id}
                style={{
                  left: `${position}%`,
                  opacity: isVisible ? 1 : 0,
                }}
              >
                <span>{note.chord}</span>
                <small>{note.chord === 'Am' ? 'A MINOR' : 'MAJOR'}</small>
              </div>
            );
          })}
          {!isPlaying && (
            <div className="lane-message">
              {isFinished ? 'FINISH!' : 'PRESS START'}
            </div>
          )}
        </div>

        <div className="progress-track">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="progress-labels">
          <span>0:00</span>
          <span>0:19</span>
        </div>
      </section>

      <section className="controls">
        <div className="key-guide">
          {(Object.entries(KEY_TO_CHORD) as [string, Chord][]).map(
            ([key, chord]) => (
              <button
                type="button"
                className={`key key-${chord.toLowerCase()}`}
                key={key}
                onClick={() => handleChord(chord)}
                disabled={!isPlaying}
              >
                <kbd>{key.toUpperCase()}</kbd>
                <span>{chord}</span>
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className="start-button"
          onClick={startGame}
          disabled={isPlaying}
        >
          <span className="play-icon">▶</span>
          <span>{isPlaying ? 'PLAYING...' : 'リズムモード開始'}</span>
        </button>
        <p className="hint">キーボードの C・G・A・F キーでプレイ</p>
      </section>
    </main>
  );
}

export default App;
