export type IPermission = {
	id: string;
	created_at: string;
	role: "user" | "admin";
	status: "active" | "resigned";
	member_id: string;
	members: {
		id: string;
		created_at: string;
		name: string;
		email: string;
	};
};