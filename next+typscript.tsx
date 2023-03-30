import { useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { Image, Heading, Button } from "@chakra-ui/react";
import { allQuestions } from "../utils/questionsData";
import styles from "../styles/Home.module.scss";

interface QuestionI {
  options: OptionI[];
  isDone: boolean;
}

interface OptionI {
  correct: boolean;
  img: string;
  selected?: boolean;
}

const Home: NextPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [questions, setQuestions] = useState<QuestionI[]>(allQuestions);
  const [displaScore, setDisplayScore] = useState<boolean>(false);

  const onClickImage = (index: number) => {
    let a = [...questions];
    const current = a[currentQuestion];
    if (!current.isDone) {
      let question = { ...current, isDone: true };
      let options = [...question.options];
      let option = { ...options[index] };
      option["selected"] = true;
      options[index] = option;
      question.options = options;
      a[currentQuestion] = question;
      if (
        questions[currentQuestion].options[index].correct &&
        !questions[currentQuestion].options[index]?.selected
      ) {
        setScore(score + 1);
      }
      setQuestions(a);

      setTimeout(() => {
        currentQuestion !== 14
          ? setCurrentQuestion(currentQuestion + 1)
          : setDisplayScore(true);
      }, 1000);
    }
  };

  const redirectUrl = `https://twitter.com/intent/tweet?text=Just%20took%20this%20quiz%20to%20improve%20my%20sh%2Atpost%20smelling%20quiz.%20%0A%0AScored%20a%20${score}/15.%20%0A%0ACan%20you%20beat%20it?%0A%0Ahttps%3A//quiz.elonshitposts.com/r?s%3D${score}`;

  return (
    <div className={styles.container}>
      {!displaScore ? (
        <div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Heading as="h3" size="xl" style={{ margin: "2rem 0" }}>
              {currentQuestion + 1}/ Which of these sh*tposts did Elon write?
            </Heading>
            <div className="que-container">
              <div className="que-img">
                <div className="que-img-col">
                  <div
                    className={`${questions[currentQuestion]?.options[0]?.selected
                        ? questions[currentQuestion].options[0].correct
                          ? styles.correct
                          : styles.error
                        : null
                      }`}
                  >
                    <Image
                      src={questions[currentQuestion].options[0].img}
                      alt="Image 1"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => onClickImage(0)}
                    />
                  </div>
                </div>
                <div className="que-img-col">
                  <div
                    className={`${questions[currentQuestion]?.options[1]?.selected
                        ? questions[currentQuestion].options[1].correct
                          ? styles.correct
                          : styles.error
                        : null
                      }`}
                  >
                    <Image
                      src={questions[currentQuestion]?.options[1].img}
                      alt="Image 2"
                      style={{ cursor: "pointer" }}
                      maxHeight="100%"
                      onClick={() => onClickImage(1)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Heading as="h4" size="lg" className="score-num">
                Score: {score}/15
              </Heading>
            </div>
          </div>
        </div>
      ) : (
        <div className="result-row">
          <div className="result-col result-text">
            <Heading as="h3" size="lg" style={{ margin: "1rem 0" }}>
              Youre Score: {score}/15
            </Heading>
            <Heading as="h3" size="xl" style={{ margin: "1rem 0" }}>
              IMPRESSIVE!
            </Heading>
          </div>
          <div className="result-col result-img">
            <Heading as="h5" size="lg" style={{ margin: "1rem 0" }}>
              Share your 💩 performance on Twitter!
            </Heading>
            <Image
              src="/images/resultImage.png"
              alt="Result"
              style={{ cursor: "pointer" }}
              maxHeight="100%"
            />
            <Link href={redirectUrl}>
              <Button size="lg" className="score-btn" >Tweet My Score</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
