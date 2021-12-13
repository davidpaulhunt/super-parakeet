import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Spacer,
  Progress,
  Tag,
  useTheme
} from "@geist-ui/react";

/**
 * Curry function from SG to calculate likelihood of ant winning.
 * Do not change.
 */
 function generateAntWinLikelihoodCalculator() {
const delay = 7000 + Math.random() * 7000;
const likelihoodOfAntWinning = Math.random();

return (callback: (x: number) => void) => {
    setTimeout(() => {
    callback(likelihoodOfAntWinning);
    }, delay);
};
}

// Compare ants based on their likelihood.
function compareAnts(a: AntWithLikelihood, b: AntWithLikelihood) {
return (b.likelihood ?? 0) - (a.likelihood ?? 0);
}

// Types and enums
interface Ant {
name: string;
length: number;
color: string;
weight: number;
}

// Global race state
enum RaceStates {
NotYetRun = "not yet run",
InProgress = "in progress",
AllCalculated = "all calculated"
}

// Individual ant states
enum AntStates {
NotYetRun = "not yet run",
InProgress = "in progress",
Calculated = "calculated"
}

// Better than all the ? if/else
const tagTypeByState = {
[AntStates.NotYetRun]: "secondary",
[AntStates.InProgress]: "warning",
[AntStates.Calculated]: "success"
} as const;

type AntWithLikelihood = Ant & { likelihood?: number; state: AntStates };

function raceAnts(ants: Array<AntWithLikelihood>, decrementRacers: () => void) {
for (const ant of ants) {
    ant.likelihood = undefined;
    ant.state = AntStates.InProgress;
    generateAntWinLikelihoodCalculator()((likelihood) => {
    ant.likelihood = likelihood;
    ant.state = AntStates.Calculated;
    decrementRacers();
    });
}
}

// Dumb display component for the Ants
function AntTable({ ants }: { ants: Array<AntWithLikelihood> }) {
const sortedAnts = ants.sort(compareAnts).map((ant) => ({
    ...ant,
    color: <span style={{ color: ant.color.toLowerCase() }}>{ant.color}</span>,
    state: <Tag type={tagTypeByState[ant.state]}>{ant.state}</Tag>
}));

return (
    <Table data={sortedAnts}>
    <Table.Column prop="name" label="Name" />
    <Table.Column prop="length" label="Length" />
    <Table.Column prop="color" label="Color" />
    <Table.Column prop="weight" label="Weight" />
    <Table.Column prop="state" label="State" />
    <Table.Column prop="likelihood" label="Likelihood" />
    </Table>
);
}

function Ants() {
  const theme = useTheme();
  // Obviously, we might want to aggregate these useState calls into a more robuse useReducer.
  const [isLoading, setIsLoading] = useState(false);
  const [ants, setAnts] = useState<Array<AntWithLikelihood>>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [racerCount, setRacerCount] = useState(0);
  const [raceState, setRaceState] = useState<RaceStates>(RaceStates.NotYetRun);
  const colors = {
      20: theme.palette.error,
      40: theme.palette.warning,
      60: theme.palette.success,
      80: "#000"
  };

  // Easy way to know when each a race is over
  useEffect(() => {
      if (isRacing && racerCount === 0) {
      setRaceState(RaceStates.AllCalculated);
      setIsRacing(false);
      }
  }, [isRacing, racerCount]);

  // Calculate progress bar value
  const progress = ((ants.length - racerCount) / ants.length) * 100;

  if (ants.length === 0) {
    return (
      <Button
      // probably want to memoize this
      onClick={() => {
        setIsLoading(true);
        fetch("https://sg-ants-server.herokuapp.com/ants").then(res => res.json()).then(({ ants }: { ants: Array<Ant> }) => {
          setAnts(
            ants.map((ant) => ({
              ...ant,
              state: AntStates.NotYetRun
            }))
          );
          setIsLoading(false);
        })
          .catch((error: Error) => {
            alert(`There was an error ${error.toString()}`);
          });
      }}
      loading={isLoading}
    >
      Fetch Ants
    </Button>
    );
  }

  return (
    <>
      Race:&nbsp;
      <Tag>
        {raceState}
      </Tag>
      <Spacer />
      <AntTable ants={ants} />
      <Spacer />
      <Button
        // another one to memoize
        onClick={() => {
          setIsRacing(true);
          setRaceState(RaceStates.InProgress);
          setRacerCount(ants.length);
          raceAnts(ants, () => {
            setRacerCount((prevCount) => prevCount - 1);
          });
        }}
        loading={isRacing}
        type="success"
      >
        Start Race
      </Button>
      <Spacer />
      {isRacing && <Progress value={progress} colors={colors} />}
      <Spacer />
    </>
  )
}

export default Ants;
