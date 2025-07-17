// ==UserScript==
// @name         스파르타코딩클럽 중간 인증 스크립트
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  매일 오후 4시 1분에 내일배움캠프 출석 페이지를 새로고침하고 자동으로 중간 인증 및 열공 인증 버튼을 클릭합니다.
// @author       Gemini
// @match        https://nbcamp.spartacodingclub.kr/mypage/attendance/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // --- 설정 ---
    const TARGET_HOUR = 16; // 목표 시간 (16시)
    const TARGET_MINUTE = 1; // 목표 분 (1분)
    const BUTTON_1_SELECTOR = 'button.css-1pj6ss6'; // 첫 번째 버튼 선택자 (중간 인증)
    const BUTTON_2_SELECTOR = 'button.css-xouvpo'; // 두 번째 버튼 선택자 (열공 인증하기)
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
     * 출석 체크 버튼 클릭 시퀀스를 실행하는 함수
     */
    const runClickSequence = () => {
        console.log('[자동 출석] 출석 체크 시퀀스를 시작합니다.');

        // 1. '중간 인증' 버튼 클릭
        setTimeout(() => {
            const button1 = document.querySelector(BUTTON_1_SELECTOR);
            if (button1 && button1.innerText.includes('중간 인증')) {
                console.log(`[자동 출석] 1단계: "${button1.innerText}" 버튼을 클릭합니다.`);
                button1.click();

                // 2. '열공 인증하기' 버튼 클릭
                setTimeout(() => {
                    const button2 = document.querySelector(BUTTON_2_SELECTOR);
                    if (button2 && button2.innerText.includes('열공 인증하기')) {
                        console.log(`[자동 출석] 2단계: "${button2.innerText}" 버튼을 클릭합니다.`);
                        button2.click();
                        console.log('[자동 출석] 모든 인증 절차를 완료했습니다.');
                    } else {
                        console.error('[자동 출석] 2단계 "열공 인증하기" 버튼을 찾지 못했습니다.');
                    }
                }, 3000); // 3초 후 두 번째 버튼 클릭

            } else {
                console.error('[자동 출석] 1단계 "중간 인증" 버튼을 찾지 못했습니다. 사이트 구조가 변경되었을 수 있습니다.');
            }
            // 작업 완료 후 세션 스토리지 정리
            sessionStorage.removeItem('attendance_check_started');
        }, 3000); // 3초 후 첫 번째 버튼 클릭
    };

    /**
     * 지정된 시간에 출석 체크를 트리거하는 함수
     */
    const checkTimeAndTrigger = () => {
        const now = new Date();
        const todayStr = getTodayString();
        const lastRunDate = localStorage.getItem('attendance_last_run_date');

        // 오늘 이미 실행했다면 더 이상 확인하지 않음
        if (lastRunDate === todayStr) {
            console.log(`[자동 출석] 오늘은 이미 ${TARGET_HOUR}시 ${TARGET_MINUTE}분에 출석 체크를 시도했습니다.`);
            return;
        }

        // 목표 시간이 되면 실행
        if (now.getHours() === TARGET_HOUR && now.getMinutes() === TARGET_MINUTE) {
            console.log(`[자동 출석] 오후 ${TARGET_HOUR}시 ${TARGET_MINUTE}분입니다. 출석 체크를 위해 페이지를 새로고침합니다.`);

            // 오늘 실행했음을 로컬 스토리지에 기록 (하루에 한 번만 실행되도록)
            localStorage.setItem('attendance_last_run_date', todayStr);

            // 새로고침 후 클릭 시퀀스를 실행하기 위해 세션 스토리지에 플래그 설정
            sessionStorage.setItem('attendance_check_started', 'true');
            location.reload();
        }
    };

    // --- 스크립트 실행 ---
    window.addEventListener('load', () => {
        // 페이지가 로드된 후, 새로고침 플래그가 있는지 확인
        if (sessionStorage.getItem('attendance_check_started') === 'true') {
            runClickSequence();
        } else {
            // 플래그가 없다면, 시간 확인 인터벌 시작
            console.log('[자동 출석] 스크립트가 활성화되었습니다. 출석 시간을 기다립니다.');
            checkTimeAndTrigger(); // 페이지 로드 시 즉시 한 번 확인
            setInterval(checkTimeAndTrigger, CHECK_INTERVAL); // 이후 주기적으로 확인
        }
    });

})();