<div className="question-box">
                <h1>سوال ۱</h1>
                <input
                    type="text"
                    className="question-input"
                    placeholder="Enter the question"
                    value={"حاصل ۲+۲ چیست؟"}
                // onChange={handleQuestionChange}
                />
                <br /> <br />
                <h3 style={{ display: 'inline', marginLeft: 30 }}>وزن سوال</h3>
                <input
                    type="text"
                    className="choice-input"
                    style={{ textAlign: 'center', width: '5%' }}
                    placeholder={`Choice 1`}
                    value={4}
                />
                <br />
                <h3>گزینه‌ها</h3>
                {/* {choices.map((choice, index) => ( */}
                {/* <div key={index} className="choice-container"> */}
                <div className="choice-container">
                    <input
                        type="text"
                        className="choice-input"
                        placeholder={`Choice 1`}
                        value={"یک (۱)"}
                    />
                    <label>
                        <input
                            type="checkbox"
                            className="correct-checkbox"
                        />
                        جواب درست
                    </label>
                </div>
                <div className="choice-container">
                    <input
                        type="text"
                        className="choice-input"
                        placeholder={`Choice 1`}
                        value={"دو (۲)"}
                    />
                    <label>
                        <input
                            type="checkbox"
                            className="correct-checkbox"
                        />
                        جواب درست
                    </label>
                </div>
                <div className="choice-container">
                    <input
                        type="text"
                        className="choice-input"
                        placeholder={`Choice 1`}
                        value={"سه (۳)"}
                    // onChange={(e) => handleChoiceChange(e, index)}
                    />
                    <label>
                        <input
                            type="checkbox"
                            className="correct-checkbox"
                        />
                        جواب درست
                    </label>
                </div>
                <div className="choice-container">
                    <input
                        type="text"
                        className="choice-input"
                        placeholder={`Choice 1`}
                        value={"چهار (۴)"}
                    // onChange={(e) => handleChoiceChange(e, index)}
                    />
                    <label>
                        <input
                            type="checkbox"
                            className="correct-checkbox"
                        />
                        جواب درست
                    </label>
                </div>
                {/* ))} */}
            </div>
            <br /><br /><br /><br />
            <div className="question-box">
                <h1>سوال ۱</h1>
                <p style={{fontSize: '120%'}}>حاصل ۲+۲ چیست؟</p>
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ دانش‌آموز:</h3>
                <p style={{display: 'inline', fontSize: '120%'}}>یک (۱)</p>
                <br /> <br />
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ درست:</h3>
                <p style={{display: 'inline', fontSize: '120%'}}>چهار (۴)</p>
                <br />
                <p style={{cursor: 'pointer', color: 'blue', fontSize: '120%', fontWeight: 'bold'}}>مشاهده بازخورد</p>
                {/* {choices.map((choice, index) => ( */}
                {/* <div key={index} className="choice-container"> */}
                {/* ))} */}
            </div>
            <div className="question-box">
                <h1>سوال ۲</h1>
                <p style={{fontSize: '120%'}}>حاصل ۳+۲ چیست؟</p>
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ دانش‌آموز:</h3>
                <p style={{display: 'inline', fontSize: '120%'}}>دو (۲)</p>
                <br /> <br />
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ درست:</h3>
                <p style={{display: 'inline', fontSize: '120%'}}>پنج (۵)</p>
                <br />
                <p style={{cursor: 'pointer', color: 'blue', fontSize: '120%', fontWeight: 'bold'}}>مشاهده بازخورد</p>
                {/* {choices.map((choice, index) => ( */}
                {/* <div key={index} className="choice-container"> */}
                {/* ))} */}
            </div>
            <div className="question-box">
                <h1>سوال ۳</h1>
                <p style={{fontSize: '120%'}}>حاصل ۳+۲ چیست؟</p>
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ دانش‌آموز:</h3>
                <p style={{display: 'inline', fontSize: '120%'}}>دو (۲)</p>
                <br /> <br />
                <h3 style={{ display: 'inline', marginLeft: 20 }}>پاسخ درست:</h3>
                <p style={{display: 'inline', fontSize: '120%'}}>پنج (۵)</p>
                <br />
                <p style={{cursor: 'pointer', color: 'blue', fontSize: '120%', fontWeight: 'bold'}}>مشاهده بازخورد</p>
                {/* {choices.map((choice, index) => ( */}
                {/* <div key={index} className="choice-container"> */}
                {/* ))} */}
            </div>