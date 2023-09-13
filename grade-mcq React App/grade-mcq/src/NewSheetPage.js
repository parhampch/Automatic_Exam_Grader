import './App.css';
import './NewSheetPage.css'
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

function NewSheetPage({ currentPage, setCurrentPage, setLoadingIndicatorOpen, serverURL }) {

    const confirmStudentDetails = (newName, newStudentID) => {
        fetch(serverURL + "confirmStudentDetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                "name": newName,
                "studentID": newStudentID
            })
        })
        .then(response => response.json())
        .then(data => {
            setLoadingIndicatorOpen(false);
            if (data["success"] == true) {
                alert("ثبت پاسخ‌برگ با موفقیت انجام شد. می‌توانید نتایج دانش‌آموز را از صفحه‌ی اصلی با ورود به بخش مربوطه مشاهده نمایید.")
            } else {
                alert("خطایی رخ داده. لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است. مجددا تلاش نمایید.");
        });
    }

    const analyzeImage = () => {
        fetch(serverURL + "analyzeImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            if (data["success"] == true) {
                let newName = "";
                do {
                    newName = prompt("لطفا نام درست دانش‌آموز را در صورت لزوم، اصلاح نمایید. نام زیر به صورت خودکار از روی پاسخ‌برگ به دست آمده است:", data["name"]);
                } while (newName == undefined || newName == null || newName == "");
                let newStudentID = "";
                do {
                    newStudentID = prompt("لطفا شماره‌ی داوطلبی درست دانش‌آموز را در صورت لزوم، اصلاح نمایید. شماره‌ی داوطلبی زیر به صورت خودکار از روی پاسخ‌برگ به دست آمده است:", data["studentID"]);
                } while (newStudentID == undefined || newStudentID == null || newStudentID == "");
                confirmStudentDetails(newName, newStudentID);
            } else {
                setLoadingIndicatorOpen(false);
                alert("خطایی رخ داده. لطفا مجددا تلاش نمایید.");
            }
        })
        .catch(error => {
            setLoadingIndicatorOpen(false);
            console.log(error);
            alert("خطایی رخ داده است. دوباره تلاش نمایید.");
        });
    }

    const formSubmitted = (event) => {
        event.preventDefault();
        setLoadingIndicatorOpen(true);
        const file = document.getElementById('file-select').files[0];
        let formData = new FormData();
        formData.append('file', file, file.name);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', serverURL + "uploadFile", true);
        xhr.onload = function (e) {
            if (xhr.status === 200) {
                analyzeImage();
            } else {
                setLoadingIndicatorOpen(false);
                alert("به دلیل خطای رخ داده، لطفا مجددا اقدام به آپلود نمایید.")
            }
        };
        xhr.send(formData);
    }

    return (
        <div class="padding">
            <h1 style={{textAlign: 'center', marginBottom: 70}}>ثبت پاسخ‌برگ جدید</h1>
            <form id="upload-file-form" method = "post" enctype="multipart/form-data" onSubmit={(event) => formSubmitted(event)}>  
                <div className="upload-box">
                    <input style={{display: 'inline'}} name="file-select" type="file" id="file-select" className="upload-input" />
                </div>
                <div className='center-row-flex'>
                    <input type="submit" className='welcome-button button-margin-left' value="ثبت" />
                    <input type="button" className='welcome-button' onClick={() => {setCurrentPage("main")}} value="بازگشت" />
                </div>
            </form>  
            
        </div>
    );
}

export default NewSheetPage;
