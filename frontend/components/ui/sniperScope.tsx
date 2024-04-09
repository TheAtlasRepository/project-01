/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Xd71eMQMsMo
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import { set } from "lodash";
import React, { useState } from "react";

interface SniperScopeProps {
  //onconfirm click event type
  onConfirm: () => void;
  onCancel: () => void;
  draggable?: boolean;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export default function SniperScope({
  onConfirm,
  onCancel,
  draggable,
  onDragEnd,
}: // rect,
SniperScopeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [intialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    // console.log(rect);
    // if (!rect) return;
    if (!draggable) return;
    setIsDragging(true);

    const rect = event.currentTarget.getBoundingClientRect();
    setDragStart({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;
    // console.log("handleMouseMove");
    // setPosition((prevPosition) => ({
    //   x: prevPosition.x + event.movementX,
    //   y: prevPosition.y + event.movementY,
    // }));
    const rect = event.currentTarget.getBoundingClientRect();
    let newX = event.clientX - rect.left;
    let newY = event.clientY - rect.top;

    // newX -= dragStart.x;
    // newY -= dragStart.y;

    // newX = Math.round(newX);
    // newY = Math.round(newY);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });

    if (onDragEnd) {
      onDragEnd(position);
    }
  };

  return (
    <div className="flex">
      <div
        style={{
          transform: draggable
            ? `translate(${position.x}px, ${position.y}px)`
            : "None",
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          key="1"
          className="relative bg-transparent w-[267px] h-[229px] flex items-center justify-center"
        >
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-[200px] h-[200px] rounded-full border-4 border-black relative">
              <div className="absolute inset-0 flex justify-center ">
                <div className="w-0.5 h-full bg-black" />
              </div>
              <div className="absolute inset-0 flex items-center">
                <div className="h-0.5 w-full bg-black" />
              </div>
            </div>
          </div>
          <div className="relative bg-transparent w-[267px] h-[229px] flex items-center justify-center">
            <div className="w-[200px] h-[200px] rounded-full border-4 border-black relative">
              <div className="absolute inset-0 flex justify-center">
                <div className="w-0.5 h-full bg-black" />
              </div>
              <div className="absolute inset-0 flex items-center">
                <div className="h-0.5 w-full bg-black" />
              </div>
              <div
                className="absolute -right-11 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-black rounded-xl flex items-center justify-center
                hover:bg-gray-800 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                <MoveIcon className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-2 transform translate-y-2/3 flex items-center justify-center">
              <div
                className="w-12 h-12 bg-black rounded-xl flex items-center justify-center hover:bg-gray-800"
                onClick={onConfirm}
              >
                <CheckIcon className="text-white" />
              </div>
              <div
                className="w-12 h-12 bg-black rounded-xl flex items-center justify-center hover:bg-gray-800"
                onClick={onCancel}
              >
                <XIcon className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MoveIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <line x1="12" x2="12" y1="2" y2="22" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
