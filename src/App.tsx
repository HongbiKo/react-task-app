import { useState } from 'react'
import { appContainer, board, buttons, deleteBoardButton, loggerButton } from './App.css'
import BoardList from './components/BoardList/BoardList'
import ListsContainer from './components/ListsContainer/ListsContainer';
import { useTypedDispatch, useTypedSelector } from './hooks/redux';
import EditModal from './components/EditModal/EditModal';
import LoggerModal from './components/LoggerModal/LoggerModal';
import { deleteBoard, sort } from './store/slices/boardsSlice';
import { addLog } from './store/slices/loggerSlice';
import { v4 as uuidv4} from 'uuid';
import { DragDropContext } from 'react-beautiful-dnd';

function App() {
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState('board-0');
  const boards = useTypedSelector(state => state.boards.boardArray);
  const getActiveBoard = boards.filter(board => board.boardId === activeBoardId)[0];
  const lists = getActiveBoard.lists;
  const modalActive = useTypedSelector(state => state.boards.modalActive);

  const dispatch = useTypedDispatch();
  const handleDeleteBoard = () => {
    if(boards.length > 1) {
      dispatch(
        deleteBoard({
          boardId : getActiveBoard.boardId
        })
      );
      dispatch(
        addLog({
          logId: uuidv4(),
          logMessage: `게시판 지우기: ${getActiveBoard.boardName}`,
          logAuthor: "User",
          logTimeStamp: String(Date.now())
        })
      );

      const newIndexToset = () => {
        const indexToBeDeleted = boards.findIndex(board => board.boardId === activeBoardId);
        return indexToBeDeleted === 0 ? indexToBeDeleted + 1 : indexToBeDeleted - 1;
      }

      setActiveBoardId(boards[newIndexToset()].boardId)

    } else {
      alert('최소 게시판 개수는 한 개입니다.');
    }
  }
  const handleDragEnd = (result: any) => {
    const {destination, source, draggableId} = result;
    const sourceList = lists.filter((list) => list.listId === source.droppableId)[0];

    dispatch(
      sort({
        boardIndex: boards.findIndex(board => board.boardId === activeBoardId),
        droppableIdStart: source.droppableId,
        droppableIdEnd: destination.droppableId,
        droppableIndexStart: source.index,
        droppableIndexEnd: destination.index,
        draggableId: draggableId // (task 어떤걸 전달하는지)
      })
    );

    dispatch(
      addLog({
        logId: uuidv4(),
        logMessage : `
        리스트 "${sourceList.listName}"에서
        리스트 "${lists.filter(list => list.listId === destination.droppableId)[0].listName}"으로
        "${sourceList.tasks.filter(task => task.taskId === draggableId)[0]}"을 옮김."`,
        logAuthor : "User",
        logTimeStamp : String(Date.now())
      })
    );
  }
  return (
    <div className={appContainer}>
      {
        isLoggerOpen ? <LoggerModal setIsLoggerOpen={setIsLoggerOpen}/> : null
      }
      {
        modalActive ? <EditModal /> : null
      }
      <BoardList activeBoardId={activeBoardId} setActiveBoardId={setActiveBoardId}/>
      <div className={board}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <ListsContainer lists={lists} boardId={getActiveBoard.boardId}/>
        </DragDropContext>
      </div>
      <div className={buttons}>
          <button className={deleteBoardButton} onClick={handleDeleteBoard}>
            이 게시판 삭제하기
          </button>
          <button className={loggerButton} onClick={() => setIsLoggerOpen(!isLoggerOpen)}>
            {isLoggerOpen ? "활동 목록 숨기기" : "활동 목록 보이기"}
          </button>
      </div>
    </div>
  )
}

export default App
