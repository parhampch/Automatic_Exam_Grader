import './App.css';
import './QuestionEditorPage.css'
import React from 'react';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';

const QuestionBox = ({ question, index, setLocalInformation }) => {
    const [questionLocal, setQuestionLocalRaw] = React.useState(question);
    const setQuestionLocal = (question) => {
        setQuestionLocalRaw(question);
        setTimeout(() => {
            setLocalInformation(question);
        }, 100);
    }
    return (
        <div className="question-box">
            <h1>سوال {index + 1}</h1>
            <input
                type="text"
                className="question-input"
                placeholder="سوال خود را وارد کنید"
                value={questionLocal.question}
                onChange={(event) => {
                    setQuestionLocal({ ...questionLocal, question: event.target.value });
                }}
            />
            <br /> <br />
            <h3 style={{ display: 'inline', marginLeft: 30 }}>وزن سوال</h3>
            <input
                type="text"
                className="choice-input"
                style={{ textAlign: 'center', width: '5%' }}
                placeholder={`وزن`}
                value={questionLocal.weight}
                dir="rtl"
                onChange={(event) => {
                    setQuestionLocal({ ...questionLocal, weight: event.target.value });
                }}
            />
            <br />
            <h3>گزینه‌ها</h3>
            <div className="choice-container">
                <input
                    type="text"
                    className="choice-input"
                    placeholder={`گزینه ۱`}
                    value={questionLocal.answers[0]}
                    dir="rtl"
                    onChange={(event) => {
                        setQuestionLocal({ ...questionLocal, answers: [event.target.value, questionLocal.answers[1], questionLocal.answers[2], questionLocal.answers[3]] });
                    }}
                />
                <label>
                    <input
                        type="checkbox"
                        className="correct-checkbox"
                        checked={questionLocal.correct == 0}
                        onChange={(event) => {
                            if (event.target.checked) {
                                setQuestionLocal({ ...questionLocal, correct: 0 });
                            }
                        }}
                    />
                    جواب درست
                </label>
            </div>
            <div className="choice-container">
                <input
                    type="text"
                    className="choice-input"
                    placeholder={`گزینه ۲`}
                    value={questionLocal.answers[1]}
                    dir="rtl"
                    onChange={(event) => {
                        setQuestionLocal({ ...questionLocal, answers: [questionLocal.answers[0], event.target.value, questionLocal.answers[2], questionLocal.answers[3]] });
                    }}
                />
                <label>
                    <input
                        type="checkbox"
                        className="correct-checkbox"
                        checked={questionLocal.correct == 1}
                        onChange={(event) => {
                            if (event.target.checked) {
                                setQuestionLocal({ ...questionLocal, correct: 1 });
                            }
                        }}
                    />
                    جواب درست
                </label>
            </div>
            <div className="choice-container">
                <input
                    type="text"
                    className="choice-input"
                    placeholder={`گزینه ۳`}
                    value={questionLocal.answers[2]}
                    dir="rtl"
                    onChange={(event) => {
                        setQuestionLocal({ ...questionLocal, answers: [questionLocal.answers[0], questionLocal.answers[1], event.target.value, questionLocal.answers[3]] });
                    }}
                />
                <label>
                    <input
                        type="checkbox"
                        className="correct-checkbox"
                        checked={questionLocal.correct == 2}
                        onChange={(event) => {
                            if (event.target.checked) {
                                setQuestionLocal({ ...questionLocal, correct: 2 });
                            }
                        }}
                    />
                    جواب درست
                </label>
            </div>
            <div className="choice-container">
                <input
                    type="text"
                    className="choice-input"
                    placeholder={`گزینه ۴`}
                    value={questionLocal.answers[3]}
                    dir="rtl"
                    onChange={(event) => {
                        setQuestionLocal({ ...questionLocal, answers: [questionLocal.answers[0], questionLocal.answers[1], questionLocal.answers[2], event.target.value] });
                    }}
                />
                <label>
                    <input
                        type="checkbox"
                        className="correct-checkbox"
                        checked={questionLocal.correct == 3}
                        onChange={(event) => {
                            if (event.target.checked) {
                                setQuestionLocal({ ...questionLocal, correct: 3 });
                            }
                        }}
                    />
                    جواب درست
                </label>
            </div>
            {/* ))} */}
        </div>
    );
}

function QuestionEditorPage({ currentPage, setCurrentPage, setLoadingIndicatorOpen, allQuestions, setAllQuestions, serverURL }) { // main - question-editor - each-student - new-student  
    const [localAllQuestions, setLocalAllQuestions] = React.useState(allQuestions);
    const submitQuestions = () => {
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "setAllQuestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ questions: localAllQuestions })
        })
            .then(response => response.json())
            .then(data => {
                setAllQuestions(localAllQuestions);
                setTimeout(() => {
                    setCurrentPage("main");
                    setTimeout(() => {
                        setLoadingIndicatorOpen(false);
                    }, 100);
                }, 100);
            })
            .catch((error) => {
                setLoadingIndicatorOpen(false);
                console.log('Error:', error);
                alert('خطایی رخ داده است. لطفا مجددا تلاش نمایید.');
            });
    }
    return (
        <div class="padding">
            <h1 style={{textAlign: 'center', marginBottom: 70}}>ویرایش سوالات و پاسخ‌ها</h1>
            <div className='center-row-flex'>
                <input type="button" className='welcome-button button-margin-left' onClick={() => {submitQuestions()}} value="ثبت سوالات و پاسخ‌های جدید" />
                <input type="button" className='welcome-button' onClick={() => {setCurrentPage("main")}} value="بازگشت بدون ثبت" />
            </div>
            {localAllQuestions.map((question, index) => {
                return <QuestionBox question={question} index={index} setLocalInformation={(newQuestion) => {
                    let newLocalAllQuestions = localAllQuestions;
                    newLocalAllQuestions[index] = newQuestion;
                    setLocalAllQuestions(newLocalAllQuestions);
                }} />
            })}

        </div>
    );
}

export default QuestionEditorPage;
