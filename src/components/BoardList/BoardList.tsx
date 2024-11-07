import React, { FC, useState, useRef } from 'react'
import { useTypedDispatch, useTypedSelector } from '../../hooks/redux';
import { FiPlusCircle, FiLogIn } from 'react-icons/fi';
import SideForm from './SideForm/SideForm';
import { addButton, addSection, boardItem, boardItemActive, container, title } from './BoardList.css';
import clsx from 'clsx';
import { GoSignOut } from 'react-icons/go'; 
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { app } from '../../firebase';
import { removeUser, setUser } from '../../store/slices/userSlice';
import { useAuth } from '../../hooks/useAuth';


type TBoardListProps = {
  activeBoardId: string;
  setActiveBoardId: React.Dispatch<React.SetStateAction<string>>
}

const BoardList : FC<TBoardListProps> = ({
  activeBoardId,
  setActiveBoardId
}) => {
  const { boardArray } = useTypedSelector(state => state.boards);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useTypedDispatch();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const { isAuth } = useAuth();
  // console.log(isAuth);

  const handleLogin = () => {
    signInWithPopup(auth, provider) // 팝업 뜨게함 -> 로그인 하고나서
    .then(userCredential => { // 그 다음 과정은 여기서 처리
      // 구글로 로그인한 사람의 정보가 userCredential에 있음
      // console.log(userCredential);
      dispatch(
        setUser({
          email: userCredential.user.email,
          id: userCredential.user.uid,
        })
      );
    })
    .catch(error => {
      console.error(error);
    })
  }
  const handleSignOut = () => {
    signOut(auth)
    .then(() => {
      dispatch(
        removeUser()
      );
    })
    .catch((error) => {
      console.error(error);
    })
  }


  const handleClick = () => {
    setIsFormOpen(!isFormOpen);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }
  return (
    <div className={container}>
      <div className={title}>게시판:</div>
      {
        boardArray.map((board, index) => (
        <div key={board.boardId} onClick={() => setActiveBoardId(boardArray[index].boardId)} className={
          clsx(
            {
              [boardItemActive] : boardArray.findIndex(b => b.boardId == activeBoardId) === index,
            },
            {
              [boardItem] : boardArray.findIndex(b => b.boardId === activeBoardId) !== index
            }
        )}>
          <div>{board.boardName}</div>
        </div>
        ))
      }
      <div className={addSection}>
        {
          isFormOpen ? <SideForm inputRef={inputRef} setIsFormOpen={setIsFormOpen} /> : <FiPlusCircle className={addButton} onClick={handleClick}/> 
        }
        {
          isAuth ? <GoSignOut className={addButton} onClick={handleSignOut}/> : <FiLogIn className={addButton} onClick={handleLogin}/>
        }
      </div>
    </div>
  )
}

export default BoardList