import { getAppointmentMeta } from "@/api/appointments";
import { createPayment } from "@/api/payments";
import ErrorAlert from "@/components/ErrorAlert";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import SelectField from "@/components/SelectField";
import { useAuth } from "@/store";
import { formatCurrency } from "@/utils/constants";
import { validateCreatePaymentSchema } from "@/utils/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

export default function CreatePayment() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAppointmentId, setShowAppointmentId] = useState(false);
  const [showAdmission, setShowAdmission] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setError] = useState(null);
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { isPending, data, error, isError } = useQuery({
    queryKey: ["getAppointmentsMeta", accessToken],
    queryFn: () => getAppointmentMeta(accessToken),
  });
  const metaData = data?.data?.data;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validateCreatePaymentSchema),
  });

  const paymentTypeField = watch("paymentType");

  useEffect(() => {
    if (paymentTypeField === "appointment") {
      setShowAppointmentId(true);
    } else {
      setShowAppointmentId(false);
    }
    if (paymentTypeField === "admission") {
      setShowAdmission(true);
    } else {
      setShowAdmission(false);
    }
  }, [paymentTypeField]);
  //fetch patients
  const patientsName = useMemo(() => {
    const patients = metaData?.patientMeta || [];
    return patients.map((patient) => ({
      id: patient?.userId?._id,
      name: patient?.userId?.fullname,
    }));
  }, [metaData]);

  //fetch appointments
  const appointmentIds = useMemo(() => {
    const appointments = metaData?.appointmentMeta || [];
    return appointments.map((appointment) => ({
      id: appointment?._id,
      name: appointment?.patientId?.fullname,
    }));
  }, [metaData]);

  //fetch rooms
  const roomIds = useMemo(() => {
    const rooms = metaData?.roomMeta || [];
    return rooms.map((room) => ({
      id: room?._id,
      name:
        room?.roomNumber +
        "-" +
        formatCurrency(room?.roomPrice) +
        "-" +
        room?.roomDescription,
    }));
  }, [metaData]);

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: async (response) => {
      if (response.status === 201) {
        setMsg(response?.data?.message);
        setShowSuccess(true);
      }
    },
    onError: (error) => {
      console.error(error);
      setError(error?.response?.data?.message || "Error creating payment");
    },
  });

  const resetModal = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["getPatientPayments"] }),
      queryClient.invalidateQueries({ queryKey: ["getAllPayments"] }),
    ]);
    setIsOpen(false);
    setShowSuccess(false);
    setError(null);
    reset();
  };

  const paymentType = ["appointment", "admission", "other"];
  if (isPending) {
    return <div className="my-4 text-center">Fetching data...</div>;
  }

  const onSubmit = async (formData) => {
    mutation.mutate({ formData, accessToken });
  };

  return (
    <>
      <button
        className="btn bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Create <span className="hidden md:inline">Payment</span>
      </button>
      <Modal
        isOpen={isOpen}
        id="createPaymentModal"
        classname="bg-white p-4 rounded-xl shadow-lg w-[90%] max-w-[600px] mx-auto"
        title={`${showSuccess ? "" : "New Payment"}`}
        showClose
        onClose={() => setIsOpen(false)}
      >
        {isError ||
          (err && <ErrorAlert error={error?.response?.data?.message || err} />)}
        {showSuccess ? (
          <>
            <div className="p-4 text-center max-w-[400px] mx-auto">
              <img
                src="/Success.svg"
                alt="success"
                className="w-full h-[200px]"
              />
              <h1 className="text-2xl font-bold">Congratulations!</h1>
              <p className="text-gray-600">{msg}</p>
              <button
                onClick={resetModal}
                className="my-4 btn bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go back to Payments
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:grid grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <SelectField
                  label="Patient Name"
                  id="patientId"
                  register={register}
                  name="patientId"
                  placeholder="Patient name"
                  data={patientsName}
                  errors={errors}
                />
              </div>
              <div className="md:col-span-6">
                <SelectField
                  label="Payment Type"
                  id="paymentType"
                  register={register}
                  name="paymentType"
                  placeholder="Payment type"
                  data={paymentType}
                  errors={errors}
                />
              </div>
              {showAppointmentId && (
                <div className="md:col-span-12">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                      Select Appointment Id
                    </legend>
                    <select
                      defaultValue={""}
                      className="select capitalize w-full"
                      name="appointmentId"
                      {...register("appointmentId")}
                    >
                      <option value="">Select appointment id</option>
                      {appointmentIds?.map((option, index) => (
                        <option key={index} value={option.id}>
                          AppointmentId - {option.id + "-" + option.name}
                        </option>
                      ))}
                    </select>
                    {errors?.appointmentId?.message && (
                      <span className="text-xs text-red-500">
                        {errors?.appointmentId?.message}
                      </span>
                    )}
                  </fieldset>
                </div>
              )}
              {showAdmission && (
                <div className="md:col-span-12">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Select Room</legend>
                    <select
                      defaultValue={""}
                      className="select capitalize w-full"
                      name="roomId"
                      {...register("roomId")}
                    >
                      <option value="">Select room</option>
                      {roomIds?.map((option, index) => (
                        <option key={index} value={option.id}>
                          Room {option.name}
                        </option>
                      ))}
                    </select>
                    {errors?.roomId?.message && (
                      <span className="text-xs text-red-500">
                        {errors?.roomId?.message}
                      </span>
                    )}
                  </fieldset>
                </div>
              )}
              <div className="md:col-span-12">
                <fieldset className="fieldset relative">
                  <legend className="fieldset-legend">Notes</legend>
                  <textarea
                    className="textarea w-full"
                    placeholder="Short note about payment"
                    {...register("notes")}
                  ></textarea>
                </fieldset>
                {errors?.notes?.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.notes?.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-6">
                <FormField
                  label="Amount"
                  id="amount"
                  register={register}
                  name="amount"
                  placeholder="Amount"
                  errors={errors}
                  type="number"
                />
              </div>
            </div>
            <div className="mt-6 mb-2 flex w-full justify-end gap-2">
              <button
                type="button"
                className="btn btn-outline w-[120px] border-[0.2px] border-gray-500"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-blue-500 hover:bg-blue-600 text-white w-[120px]"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
