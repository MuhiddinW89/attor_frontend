import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markReminderSent } from "../../services/reminders/mark-sent";

type Props = {
    id: string;
};

export default function MarkSentButton({ id }: Props) {
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: () => markReminderSent(id),

        onSuccess: () => {
            setIsOpen(false);

            queryClient.invalidateQueries({
                queryKey: ["reminders"],
            });
        },
    });

    function handleConfirm() {
        mutation.mutate();
    }

    return (
        <>
            {/* Основная кнопка в карточке */}
            <button
                type="button"
                className="mark-sent-button"
                onClick={() => setIsOpen(true)}
                disabled={mutation.isPending}
            >
                {mutation.isPending
                    ? "Saving..."
                    : "✓ Mark Completed"}
            </button>

            {/* Popup */}
            {isOpen && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <h3>Mark completed?</h3>

                        <p>
                            Are you sure you want to mark this
                            reminder as completed?
                        </p>

                        <div className="confirm-actions">
                            <button
                                type="button"
                                className="confirm-no"
                                onClick={() => setIsOpen(false)}
                                disabled={mutation.isPending}
                            >
                                No
                            </button>

                            <button
                                type="button"
                                className="confirm-yes"
                                onClick={handleConfirm}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending
                                    ? "Saving..."
                                    : "Yes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}