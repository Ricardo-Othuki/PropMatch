import { Outlet } from 'react-router-dom';
import AgentChat from './dashboard/AgentChat';

export default function Layout() {
  return (
    <>
      <Outlet />
      <AgentChat />
    </>
  );
}