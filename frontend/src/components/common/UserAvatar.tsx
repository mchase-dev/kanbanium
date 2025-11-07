import { useMemo } from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";
import type { User } from "../../types/api";

interface UserAvatarProps {
  user: User; //| { firstName: string; lastName: string; id: string; avatarUrl?: string }
  size?: "small" | "default" | "large" | number;
  style?: React.CSSProperties;
}

export function UserAvatar({ user, size = "default", style }: UserAvatarProps) {
  const altText = `${user.firstName} ${user.lastName}`.trim() || user.userName;

  // If user has custom avatar URL, use it
  if (user.avatarUrl) {
    return <Avatar src={user.avatarUrl} size={size} style={style} alt={altText} />;
  }

  // Generate DiceBear initials avatar
  const avatarSvg = useMemo(() => {
    //const fullName = `${user.firstName} ${user.lastName}`.trim()
    const emailAddress = user.userName + "+" + user.email;

    try {
      const avatar = createAvatar(bottts, {
        seed: emailAddress, // Use email as seed - generates consistent robot for each user
      });

      return avatar.toDataUri();
    } catch (error) {
      console.error("Error generating avatar:", error);
      return null;
    }
  }, [user.email, user.userName]);

  // If we have a generated avatar, use it
  if (avatarSvg) {
    return <Avatar src={avatarSvg} size={size} style={style} alt={altText} />;
  }

  // Final fallback: show first letter of first name with icon
  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || "?";

  return (
    <Avatar icon={<UserOutlined />} size={size} style={style} alt={altText}>
      {firstLetter}
    </Avatar>
  );
}
