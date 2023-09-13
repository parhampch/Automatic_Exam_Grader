import './App.css';
import './MainPage.css'
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

function MainPage({ currentPage, setCurrentPage, setLoadingIndicatorOpen, setAllQuestions, setAllSubmissions, serverURL, setServerURL, setStudentNames }) {

    const goToQuestionEditor = () => {
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "getAllQuestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            if (data["success"] == true) {
                setAllQuestions(data["result"]);
                setTimeout(() => {
                    setCurrentPage("question-editor");
                    setTimeout(() => {
                        setLoadingIndicatorOpen(false);
                    }, 100);
                }, 100);
            } else {
                setLoadingIndicatorOpen(false);
                alert("خطایی رخ داده است. لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است. لطفا دوباره تلاش نمایید.");
        });
    }

    const goToAllStudentsPageStepOne = () => {
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "getAllQuestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            if (data["success"] == true) {
                console.log(data);
                setAllQuestions(data["result"]);
                setTimeout(() => {
                    setLoadingIndicatorOpen(false);
                    goToAllStudentsPageStepTwo();
                }, 100);
            } else {
                setLoadingIndicatorOpen(false);
                alert("خطایی رخ داده است. لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است. لطفا دوباره تلاش نمایید.");
        });
    }

    const goToAllStudentsPageStepTwo = () => {
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "getAllSubmissions", {
            method: "GET",
            // headers: {
            //     "Content-Type": "application/json; charset=utf-8"
            // }
        })
        .then(response => response.json())
        .then(data => {
            if (data["success"] == true) {
                console.log(data);
                setAllSubmissions(data["result"]);
                setTimeout(() => {
                    setCurrentPage("each-student");
                    setTimeout(() => {
                        setLoadingIndicatorOpen(false);
                    }, 100);
                }, 100);
            } else {
                setLoadingIndicatorOpen(false);
                alert("خطایی رخ داده است. لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است. لطفا دوباره تلاش نمایید.");
        });
    }

    const goToStudentNamesPage = () => {
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "getAllStudentNames", {
            method: "GET",
            // headers: {
            //     "Content-Type": "application/json; charset=utf-8"
            // }
        })
        .then(response => response.json())
        .then(data => {
            if (data["success"] == true) {
                console.log(data);
                setStudentNames(data["result"]);
                setTimeout(() => {
                    setCurrentPage("student-names");
                    setTimeout(() => {
                        setLoadingIndicatorOpen(false);
                    }, 100);
                }, 100);
            } else {
                setLoadingIndicatorOpen(false);
                alert("خطایی رخ داده است، لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است، لطفا دوباره تلاش نمایید.");
        });
    }
   
    const setNegativePoint = () => {
        let newNegativePoint = "";
        do {
            newNegativePoint = prompt("لطفا ضریب نمره منفی (یک عدد صحیح) را وارد نمایید. برای حذف نمره منفی، عدد صفر را وارد نمایید.");
        } while (newNegativePoint == undefined || newNegativePoint == null || newNegativePoint == "" || isNaN(newNegativePoint));
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "setNegativePoint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({"negativePoint": newNegativePoint})
        })
        .then(response => response.json())
        .then(data => {
            setLoadingIndicatorOpen(false);
            if (data["success"] == true) {
                alert("ثبت نمره منفی جدید با موفقیت انجام شد.");
            } else {
                alert("خطایی رخ داده است. لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است. لطفا دوباره تلاش نمایید.");
        });
    }


    return (
      <>
        <div className='middle-container'>
            <div className='middle-box'>
                <input dir="ltr" type="text" value={serverURL} onChange={(event) => {setServerURL(event.target.value)}} style={{padding: 10, width: 500, textAlign: 'center', backgroundColor: 'transparent', borderRadius: 10, fontFamily: 'monospace', fontSize: '140%'}} />
                <br /> <br /> <br />
                <div className='welcome-title'>خوش آمدید!</div>
                <div className='welcome-text'>برای شروع به کار، یکی از گزینه‌های زیر را انتخاب کنید:</div>
                <input type="button" className='welcome-button' onClick={() => goToQuestionEditor()} value="ویرایش سوالات و پاسخ‌ها" /> 
                <input type="button" className='welcome-button' onClick={() => goToAllStudentsPageStepOne()} value="نمایش نمرات هر دانش‌آموز" />
                <input type="button" className='welcome-button' onClick={() => setCurrentPage("new-sheet")} value="ثبت پاسخ‌برگ جدید" />
                <input type="button" className='welcome-button' onClick={() => goToStudentNamesPage()} value="لیست تمامی دانش‌آموزان" />
                <input type="button" className='welcome-button' onClick={() => setNegativePoint()} value="ثبت ضریب نمره منفی" />
                ساخته شده توسط سید پارسا نشایی، پرهام چاوشیان و میلاد سعادت - درس آز سخت‌افزار
            </div>
        </div>
      </>
    );
  }
  
  export default MainPage;