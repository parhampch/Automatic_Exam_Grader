import './App.css';
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
import MainPage from './MainPage';
import QuestionEditorPage from './QuestionEditorPage';
import AllStudentsPage from './AllStudentsPage';
import NewSheetPage from './NewSheetPage';
import StudentNamesPage from './StudentNamesPage';

function App() {
  const [currentPage, setCurrentPage] = React.useState("main"); // main - question-editor - each-student - new-sheet - student-names
  const [isLoadingIndicatorOpen, setLoadingIndicatorOpen] = React.useState(false);
  const [allQuestions, setAllQuestions] = React.useState([]);
  const [allSubmissions, setAllSubmissions] = React.useState([]);
  const [serverURL, setServerURL] = React.useState("http://192.168.1.157:5001/");
  const [studentNames, setStudentNames] = React.useState([]);

  return (
    <>
      {currentPage == "main" ?
        <MainPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} setAllQuestions={setAllQuestions} setAllSubmissions={setAllSubmissions} serverURL={serverURL} setServerURL={setServerURL} setStudentNames={setStudentNames} />
      : (currentPage == "question-editor" ?
        <QuestionEditorPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} allQuestions={allQuestions} setAllQuestions={setAllQuestions} serverURL={serverURL} /> 
      : (currentPage == "each-student" ?
      <AllStudentsPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} allSubmissions={allSubmissions} allQuestions={allQuestions} setAllQuestions={setAllQuestions} serverURL={serverURL} />
      : (currentPage == "new-sheet" ? <NewSheetPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} allSubmissions={allSubmissions} allQuestions={allQuestions} setAllQuestions={setAllQuestions} serverURL={serverURL} />
      : <StudentNamesPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} setAllQuestions={setAllQuestions} setAllSubmissions={setAllSubmissions} serverURL={serverURL} setServerURL={setServerURL} studentNames={studentNames} setStudentNames={setStudentNames} />)
      
      ))}
      <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoadingIndicatorOpen} >
          <CircularProgress color="inherit" />
      </Backdrop>
    </>


    // <>
    // currentPage == "main" ?
    // <MainPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} setAllQuestions={setAllQuestions} />
    // : 
    // (currentPage == "question-editor" ?
    // <QuestionEditorPage currentPage={currentPage} setCurrentPage={setCurrentPage} setLoadingIndicatorOpen={setLoadingIndicatorOpen} allQuestions={allQuestions} setAllQuestions={setAllQuestions} /> : <></>)

    // <Backdrop
    //     sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    //     open={isLoadingIndicatorOpen}
    // >
    //     <CircularProgress color="inherit" />
    // </Backdrop>
    // </>
  );
}

export default App;
