import { call, put, select } from "redux-saga/effects";
import { finishLoading, startLoading } from "../redux/modules/loading";
import * as authAPI from "./api/auth";

export const createRequestActionTypes = (type) => {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;
  return [type, SUCCESS, FAILURE];
};

// 회원가입 사가
export function createRegisterSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILURE = `${type}_FAILURE`;

  return function* (action) {
    yield put(startLoading(type));

    try {
      const check = yield call(authAPI.checkRegister, action.payload.id);
      const idInput = yield select((state) => state.auth.register.id);
      console.log(idInput);
      const passwordInput = yield select(
        (state) => state.auth.register.password
      );
      const passwordConfirmInput = yield select(
        (state) => state.auth.register.passwordConfirm
      );
      const nicknameInput = yield select(
        (state) => state.auth.register.nickname
      );
      // 입력창이 하나라도 빈칸일 경우 처리
      if (
        !(idInput && passwordInput && passwordConfirmInput && nicknameInput)
      ) {
        console.log("blank");
        yield put({
          type: FAILURE,
          payload: { registerCheck: "input blank" },
        });
      }
      // 비밀번호와 비밀번호 확인 값이 일치하지 않을때 처리
      else if (passwordInput !== passwordConfirmInput) {
        yield put({
          type: FAILURE,
          payload: { registerCheck: "password validation fail" },
        });
      }
      // 중복 계정이 존재할 경우 처리
      else if (check.data.length !== 0) {
        yield put({
          type: FAILURE,
          payload: { registerCheck: "overlap" },
        });
      }
      // 정상적인 회원가입 처리
      else {
        yield call(authAPI.register, {
          ...action.payload,
        });
        yield put({
          type: SUCCESS,
          payload: { registerCheck: true },
        });
      }
    } catch (e) {
      // 비정상적인 회원가입 응답에 대한 처리
      yield put({
        type: FAILURE,
        payload: { registerCheck: "register fail" },
      });
    }
    yield put(finishLoading(type));
  };
}

// 로그인 사가
export function createLoginSaga(type) {
  const SUCCESS = `${type}_SUCCESS`;
  const FAILUE = `${type}_FAILURE`;

  return function* (action) {
    yield put(startLoading(type));
    try {
      const response = yield call(authAPI.login, { ...action.payload });
      sessionStorage.setItem("token", response.data[0].id);

      yield put({
        type: SUCCESS,
        payload: {
          token: response.data[0].id,
          loginCheck: true,
        },
      });
    } catch (e) {
      yield put({
        type: FAILUE,
        payload: { loginCheck: false },
      });
    }
    yield put(finishLoading(type));
  };
}
