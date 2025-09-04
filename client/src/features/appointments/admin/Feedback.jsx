import Modal from "@/components/Modal";
import { RiChat2Fill } from "@remixicon/react";
import { useState } from "react";

export default function Feedback({ appointment }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)} title="View appointment note">
        <RiChat2Fill className="text-blue-500 cursor-pointer" />
      </button>
      <Modal
        isOpen={isOpen}
        id="openPatientAppointmentModal"
        classname="bg-white p-4 rounded-xl shadow-lg w-[90%] max-w-[400px] mx-auto"
        title={`Notes`}
        showClose
        onClose={() => setIsOpen(false)}
      >
        <h1 className="my-4">{appointment?.notes}</h1>
      </Modal>
    </>
  );
}
