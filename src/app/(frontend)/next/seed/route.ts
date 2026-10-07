export async function POST(): Promise<Response> {
  return Response.json(
    {
      error:
        'The Payload website template demo seed is disabled. Create CX83 content in the admin panel instead.',
    },
    { status: 410 },
  )
}
