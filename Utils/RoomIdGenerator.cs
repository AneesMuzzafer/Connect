namespace Connect.Utils
{
    public static class RoomIdGenerator
    {
        private static readonly Random _random = new Random();
        private const string chars = "abcdefghijklmnopqrstuvwxyz";

        public static string Create()
        {
            string id = "";
            for (int i = 0; i < 8; i++)
            {
                id += (i == 2 || i == 5) ? "-" : chars[_random.Next(chars.Length)];
            }
            return id;
        }

    }

}
