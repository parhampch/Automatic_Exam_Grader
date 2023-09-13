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

function StudentNamesPage({ currentPage, setCurrentPage, setLoadingIndicatorOpen, setAllQuestions, setAllSubmissions, serverURL, setServerURL, studentNames, setStudentNames }) {

    const [newStudentName, setNewStudentName] = React.useState("");
    const [newStudentID, setNewStudentID] = React.useState("");

    const addStudentName = () => {
        if (newStudentName == "") {
            alert("لطفا نام دانش‌آموز را به درستی وارد نمایید.");
            return;
        }
        if (newStudentID == "") {
            alert("لطفا شماره‌ی داوطلبی دانش‌آموز را به درستی وارد نمایید.");
            return;
        }
        setLoadingIndicatorOpen(true);
        fetch(serverURL + "addStudentName", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                "name": newStudentName,
                "studentID": newStudentID
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data["success"] == true) {
                setStudentNames([...studentNames, {"name": newStudentName, "studentID": newStudentID}]);
                setTimeout(() => {
                    setLoadingIndicatorOpen(false);
                    alert("افزودن با موفقیت انجام شد");
                }, 100);
            } else {
                setLoadingIndicatorOpen(false);
                alert("خطایی رخ داده، لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده، لطفا دوباره تلاش نمایید.");
        });
    }

    return (
      <>
        <div className='middle-container'>
            <div className='middle-box'>
                <input type="button" className='welcome-button' onClick={() => setCurrentPage("main")} value="بازگشت" />
                <br /> <br />
                <div className='welcome-title'>افزودن دانش‌آموز جدید</div>
                <br />
                <input type="text" value={newStudentName} onChange={(event) => {setNewStudentName(event.target.value)}} style={{padding: 10, width: 500, textAlign: 'center', backgroundColor: 'transparent', borderRadius: 10, fontSize: '140%'}} placeholder='نام و نام خانوادگی' />
                <br /> <br /> <br />
                <input type="text" value={newStudentID} onChange={(event) => {setNewStudentID(event.target.value)}} style={{padding: 10, width: 500, textAlign: 'center', backgroundColor: 'transparent', borderRadius: 10, fontSize: '140%'}} placeholder='شماره‌ی داوطلبی' />
                <br /> <br /> <br />
                <input type="button" className='welcome-button' onClick={() => addStudentName()} value="افزودن" />
                <br /> 
                <div className='welcome-title'>لیست تمامی دانش‌آموزان</div>
                <br />
                {studentNames.map((studentName, index) => {
                    return (
                        <div key={index} className='welcome-text'>{studentName.name} - {studentName.studentID}</div>
                    );
                })}
            </div>
        </div>
      </>
    );
  }
  
  export default StudentNamesPage;