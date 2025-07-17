// ==UserScript==
// @name         스파르타코딩클럽 자동 출석 (아침)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  매일 아침 8시 50분에 내일배움캠프 출석 페이지를 새로고침하고 '출석하기' 버튼을 자동으로 클릭합니다.
// @author       Gemini
// @match        https://nbcamp.spartacodingclub.kr/mypage/attendance/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- 설정 ---
    const TARGET_HOUR = 8; // 목표 시간 (오전 8시)
    const TARGET_MINUTE = 50; // 목표 분 (50분)
    const BUTTON_SELECTOR = 'button.css-1uxubwe'; // 클릭할 버튼 선택자 (출석하기)
    const CHECK_INTERVAL = 30000; // 30초마다 시간 확인

    /**
     * 오늘의 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환합니다.
     * @returns {string} 오늘 날짜 문자열
     */
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /**
     * '출석하기' 버튼 클릭을 실행하는 함수
     */
    const runClickSequence = () => {
        console.log('[아침 출석] 출석 체크 시퀀스를 시작합니다.');

        // 3초 후 '출석하기' 버튼 클릭
        setTimeout(() => {
            const attendanceButton = document.querySelector(BUTTON_SELECTOR);
            if (attendanceButton && attendanceButton.innerText.includes('출석하기')) {
                console.log(`[아침 출석] "${attendanceButton.innerText}" 버튼을 찾아 클릭합니다.`);
                attendanceButton.click();
                console.log('[아침 출석] 출석 절차를 완료했습니다.');
            } else {
                console.error('[아침 출석] "출석하기" 버튼을 찾지 못했습니다. 이미 출석했거나 사이트 구조가 변경되었을 수 있습니다.');
            }
            // 작업 완료 후 세션 스토리지 정리
            sessionStorage.removeItem('morning_attendance_check_started');
        }, 3000); // 페이지 로드 후 3초 대기
    };

    /**
     * 지정된 시간에 출석 체크를 트리거하는 함수
     */
    const checkTimeAndTrigger = () => {
        const now = new Date();
        const todayStr = getTodayString();
        // 아침 출석용 별도 스토리지 키 사용
        const lastRunDate = localStorage.getItem('morning_attendance_last_run_date');

        // 오늘 이미 실행했다면 더 이상 확인하지 않음
        if (lastRunDate === todayStr) {
            return;
        }

        // 목표 시간이 되면 실행
        if (now.getHours() === TARGET_HOUR && now.getMinutes() === TARGET_MINUTE) {
            console.log(`[아침 출석] 오전 ${TARGET_HOUR}시 ${TARGET_MINUTE}분입니다. 출석 체크를 위해 페이지를 새로고침합니다.`);

            // 오늘 실행했음을 로컬 스토리지에 기록 (하루에 한 번만 실행되도록)
            localStorage.setItem('morning_attendance_last_run_date', todayStr);

            // 새로고침 후 클릭 시퀀스를 실행하기 위해 세션 스토리지에 플래그 설정
            sessionStorage.setItem('morning_attendance_check_started', 'true');
            location.reload();
        }
    };

    // --- 스크립트 실행 ---
    window.addEventListener('load', () => {
        // 페이지가 로드된 후, 새로고침 플래그가 있는지 확인
        if (sessionStorage.getItem('morning_attendance_check_started') === 'true') {
            runClickSequence();
        } else {
            // 플래그가 없다면, 시간 확인 인터벌 시작
            console.log('[아침 출석] 스크립트가 활성화되었습니다. 출석 시간을 기다립니다.');
            checkTimeAndTrigger(); // 페이지 로드 시 즉시 한 번 확인
            setInterval(checkTimeAndTrigger, CHECK_INTERVAL); // 이후 주기적으로 확인
        }
    });

})();