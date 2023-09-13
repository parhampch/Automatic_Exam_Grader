import './App.css';
import './AllStudentsPage.css'
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

function AllStudentsPage({ currentPage, setCurrentPage, setLoadingIndicatorOpen, allQuestions, setAllQuestions, allSubmissions, serverURL }) { // main - question-editor - each-student - new-student  
    const [currentStudent, setCurrentStudent] = React.useState({"name": "", "id": ""});

    const QuestionBox = ({ question, index }) => {
        const submission = allSubmissions.filter((submission) => {
            return submission.studentID == currentStudent.id;
        })[0];
        return (
            <div className="question-box">
                <h1>سوال {index + 1}</h1>
                <p style={{ fontSize: '120%' }}>{question.question}</p>
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ دانش‌آموز:</h3>
                <p style={{ display: 'inline', fontSize: '120%' }}>{
                    submission.answers[index] == 4 ? "نزده" : question.answers[submission.answers[index]]
                }</p>
                <br /> <br />
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ درست:</h3>
                <p style={{ display: 'inline', fontSize: '120%' }}>{question.answers[question.correct]}</p>
                <br />
                <p style={{ cursor: 'pointer', color: 'blue', fontSize: '120%', fontWeight: 'bold' }} onClick={() => { getFeedback(question.question, serverURL); }}>مشاهده بازخورد</p>
            </div>
        )
    }

    const getFeedback = (wrongQuestion, serverURL) => {
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "getFeedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ wrongQuestion: wrongQuestion })
        })
            .then(response => response.json())
            .then(data => {
                setLoadingIndicatorOpen(false);
                if (data.success) alert(data.result);
                else {
                    alert('خطایی رخ داده است. مجددا تلاش نمایید.');
                }
            })
            .catch((error) => {
                setLoadingIndicatorOpen(false);
                console.log('Error:', error);
                alert('خطایی رخ داده است. لطفا مجددا تلاش نمایید.');
            });
    }

    const absoluteNumber = (number) => {
        return number > 0 ? number : number * -1;
    }

    return (
        <div class="padding">
            <h1 style={{ textAlign: 'center', marginBottom: 70 }}>مشاهده پاسخ‌های دانش‌آموزان</h1>
            <div className='center-row-flex'>
                <input type="button" className='welcome-button' onClick={() => { setCurrentPage("main") }} value="بازگشت" />
            </div>
            <Grid container spacing={10}>
                <Grid item xs={12} sm={6}>
                    <h1>لیست دانش‌آموزان</h1>
                    {allSubmissions.map((submission) => {
                        return <p style={{ fontSize: '140%', cursor: 'pointer', color: 'blue', fontWeight: 'bold' }} onClick={() => {
                            console.log(submission.studentName, submission.studentID)
                            let currentStudentNew = {"name": submission.studentName, "id": submission.studentID};
                            console.log(allSubmissions[0].studentName == currentStudentNew.name);
                            setCurrentStudent(currentStudentNew);
                        }}>{submission.studentName}</p>
                    })}
                </Grid>
                <Grid item xs={12} sm={6}>
                    {currentStudent.id == "" ? <h1>{"لطفا یک دانش‌آموز را انتخاب نمایید."}</h1> : <>
                        <h1>پاسخ‌های دانش‌آموز «{currentStudent.name}» با شماره داوطلبی {currentStudent.id}</h1>
                        <p style={{ fontSize: '180%' }}>
                            درصد: &nbsp;
                            {allSubmissions.filter((submission) => {
                                // console.log("subm", submission.studentID);
                                
                                // console.log("subm", currentStudent.id);
                                // console.log("subm", submission.name);
                                // console.log("subm", currentStudent.name);
                                console.log(submission.studentID == currentStudent.id);
                                console.log(submission.studentID);
                                console.log(currentStudent.id);
                                console.log(submission.studentName == currentStudent.name);
                                console.log(submission.studentName);
                                console.log(currentStudent.name);
                                console.log(submission.studentID == currentStudent.id && submission.studentName == currentStudent.name);
                                return submission.studentID == currentStudent.id && submission.studentName == currentStudent.name;
                            })[0].score < 0 ? "منفی " : ""}
                            {absoluteNumber(allSubmissions.filter((submission) => {
                                return submission.studentID == currentStudent.id;
                            })[0].score).toFixed(2)}
                        </p>
                        {allQuestions.map((question, index) => {
                            return <QuestionBox question={question} index={index} />
                        })}
                    </>}
                </Grid>
            </Grid>
        </div>
    );
}

export default AllStudentsPage;
