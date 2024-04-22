"use server";

import { readUserSession } from "@/lib/actions";
import { createSupbaseAdmin, createSupbaseServerClient } from "@/lib/supabase";
import { revalidatePath, unstable_noStore } from "next/cache";

export async function createMember(data: {
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
  status: "active" | "resigned";
  confirm: string;
}) {
  const { data: userSession } = await readUserSession();

  if (userSession.session?.user.user_metadata.role !== "admin") {
    return JSON.stringify({
      error: { message: "You are not allowed to do this!" },
    });
  }

  const supabase = await createSupbaseAdmin();

  const createResult = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      role: data.role,
    },
  });

  if (createResult.error?.message) {
    return JSON.stringify(createResult);
  } else {
    const memberResult = await supabase.from("members").insert({
      name: data.name,
      id: createResult.data.user?.id,
      //   email: data.email,
    });
    if (memberResult.error?.message) {
      return JSON.stringify(memberResult);
    } else {
      const persmissionResult = await supabase.from("permission").insert({
        role: data.role,
        member_id: createResult.data.user?.id,
        status: data.status,
      });
      //   revalidatePath("/dashboard/member");

      return JSON.stringify(persmissionResult);
    }
  }
}
export async function updateMemberById(id: string) {
  console.log("update member");
}
export async function deleteMemberById(user_id: string) {
	const { data: userSession } = await readUserSession();
	if (userSession.session?.user.user_metadata.role !== "admin") {
		return JSON.stringify({
			error: { message: "You are not allowed to do this!" },
		});
	}
	const supabaseAdmin = await createSupbaseAdmin();
	const deleteResult = await supabaseAdmin.auth.admin.deleteUser(user_id);

	if (deleteResult.error?.message) {
		return JSON.stringify(deleteResult);
	} else {
		const supbase = await createSupbaseServerClient();
		const result = await supbase.from("member").delete().eq("id", user_id);
		revalidatePath("/dashboard/member");
		return JSON.stringify(result);
	}
}

export async function readMembers() { 
  unstable_noStore();
  const supabase = await createSupbaseServerClient();
  const result = await  supabase.from("permission").select("*, members(*)");
console.log(result)
  return result;
}
