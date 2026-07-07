import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
import { auth, requireSession } from "@/lib/auth";
import { updateArtworkSchema } from "@/lib/validation/artwork";
import {
  deleteArtwork,
  getArtworkById,
  updateArtwork,
} from "@/services/artwork-service";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    const artwork = await getArtworkById(params.id, session?.user?.id);
    return NextResponse.json(artwork);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = updateArtworkSchema.parse(body);
    // Ownership is enforced inside the service.
    const artwork = await updateArtwork(params.id, session.user.id, input);
    return NextResponse.json({ id: artwork.id });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    await deleteArtwork(params.id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
