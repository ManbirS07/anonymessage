import prisma from "@/src/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ messageId: string }> }) {
    const { messageId } = await params;

    if (!messageId) {
        return new Response(JSON.stringify({
            success: false,
            responseMessage: "Message ID is required."
        }), { status: 400 });
    }

    try {
        await prisma.message.delete({
            where: { id: messageId }
        });

        return new Response(JSON.stringify({
            success: true,
            responseMessage: "Message deleted successfully."
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            responseMessage: "Failed to delete message."
        }), { status: 500 });
    }
}