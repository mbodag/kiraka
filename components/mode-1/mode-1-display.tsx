"use client";
import { useEffect, useState } from "react";
import HighlightableText from "./highlightable-text";
import CounterDisplay from "./counter-display";
import "@/app/globals.css";

const Mode1Display = () => {
  // const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace.

  // Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction.

  // On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates.

  // Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`

  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("white"); // Initialise background color to 'white'
  const [textColor, setTextColor] = useState("white"); // Initialise text color to 'white'
  const [summary, setSummary] = useState("");
  const [shortStory, setShortStory] =
    useState(`Diversity is a catalyst of life. By finding a novel adaptation to the
    environment, species can thrive while being neither the fastest,
    strongest nor tallest globally [31]. This notion inspired researchers
    in Evolutionary Computation (EC) to pursue Quality-Diversity (QD) optimization [15, 43, 44]. In QD optimization, performancebased competition is considered only locally between solutions
    characterized as similar. Rather than optimizing strictly for a single best-performing solution, QD optimization algorithms aim to
    return a collection of solutions that are both as diverse as possible
    and as high-performing as possible. In robotics, this allows learning
    a repertoire of behaviors which is useful since this provides alternatives if one behavior suddenly becomes ineffective due to changes
    in the environment or damage to the robot [13, 47, 48]. In many
    cases, it is also desirable for a robot to discover the entire range
    of behaviors it is capable of rather than just a single behavior that
    maximizes a certain objective [11, 16]. Greedily optimizing a given
    objective may also cause the optimization process to prematurely
    converge to a local optimum, while simultaneously searching for diverse behaviors can help to find stepping stones that overcome local
    optima and lead to finding globally more optimal behaviors [17, 32].
    QD optimization algorithms such as Multi-dimensional Archive
    of Phenotypic Elites (MAP-Elites) [13, 40, 48], are traditionally
    driven by a Genetic Algorithm (GA) for their capability of diversifying the search. This reliance on GAs limits the applicability
    of MAP-Elites to problems of low dimensionality. Typically the
    number of optimized parameters is kept below 100 [13, 15, 40]. GAs
    are also inefficient [12, 20] and prone to finding unstable solutions
    located on narrow peaks in the optimization landscape that are not
    repeatable in stochastic environments [14, 19, 25].
    Deep Reinforcement Learning (DRL) [37–39] algorithms are
    based on an opposing methodology where a single performancemaximizing behavior is sought. In DRL, behaviors are learned via a deep neural network (DNN) controller that is trained to predict the
    “optimal” action—the action that will most likely lead to maximizing the defined objective—to take given an observation. DRL leverages the function approximation strength of DNNs and powerful
    gradient-based training techniques, such as backpropagation [35],
    to guide the learning process directly towards improving performance. Using these techniques, DRL algorithms can solve problems
    in robotics that require the complex and precise control only achievable by DNNs with tens of thousands of parameters, in stochastic
    environments where learning robust behaviors is essential [22, 33].
    This paper introduces the Policy Gradient Assisted MAP-Elites
    (PGA-MAP-Elites) algorithm, an extension of MAP-Elites which
    incorporates gradient-based optimization via a method based on
    DRL algorithm Twin Delayed Deep Deterministic policy gradient
    (TD3) [22]. By evaluating PGA-MAP-Elites on a set of stochastic
    behavior generation tasks requiring robots to be controlled by large
    DNN, we show that PGA-MAP-Elites successfully scales the generation of behavioral repertoires to new domains where current versions of MAP-Elites fail. In these tasks PGA-MAP-Elites achieves a
    powerful illumination of the search space, finding high-performing
    and robust solutions across the entire range of possible behaviors,
    where the highest performing solutions found rival those of modern
    DRL algorithms. The benchmark tasks used to evaluate PGA-MAPElites have been made available as the OpenAI Gym [5] based opensource module QDgym (https://github.com/ollenilsson19/QDgym).
    This module does not rely on any proprietary software, making our
    benchmarks easy to use for other researchers.
    `);

  const toggleBackgroundColor = () => {
    // Toggle the background color between 'white' and 'black'
    setBackgroundColor((prevColor) =>
      prevColor === "white" ? "black" : "white"
    );
  };

  const toggleTextColor = () => {
    // Toggle the text color between 'black' and 'white'
    setTextColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setWordsPerMinute((prevWPM) => Math.min(prevWPM + 20, 1500)); // Increase WPM with upper bound
      } else if (event.key === "ArrowLeft") {
        setWordsPerMinute((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease WPM with lower bound
      } else if (event.key === "b" || event.key === "B") {
        // When the "B" or "b" key is pressed, toggle the background color
        toggleBackgroundColor();
      } else if (event.key === "t" || event.key === "T") {
        // When the "H" or "h" key is pressed, toggle the text color
        toggleTextColor();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleGetSummary = async () => {
    const inputText = shortStory;

    try {
      const response = await fetch("api/texts/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error getting summary:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/texts/random");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
const data = await response.json();      
setShortStory(data.text_content);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="centerContainer">
      <CounterDisplay count={wordsPerMinute} fontSize="16px" />
      <div className="textAndButtonContainer">
        <div
          className="monospaced"
          style={{
            color: textColor, // Apply the textColor state variable here
            backgroundColor, // Use the state variable for background color
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            borderRadius: "10px",
            margin: "10px",
          }}
        >
          <HighlightableText
            text={shortStory}
            highlightInterval={60000 / wordsPerMinute}
          />
        </div>
        <button className="fancyButton" onClick={handleGetSummary}>
          Get Summary
        </button>
        {summary && <p>Summary: {summary}</p>}
      </div>
    </div>
  );
};

export default Mode1Display;
