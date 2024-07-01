using Connect.Signal;
using Connect.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace Connect.Controllers
{
    [Authorize]
    public class ConnectController : Controller
    {
        private readonly RoomManager _roomManager;
        public ConnectController(RoomManager rm)
        {
            _roomManager = rm;
        }

        [Route("/Connect")]
        public IActionResult Index()
        {
            return View("Invalid");
        }

        [Route("/Connect/{roomId}")]
        public IActionResult Meeting(string roomId)
        {
            foreach (var room in _roomManager.Rooms) {
                Debug.WriteLine(room.Id);
            }

            if (!_roomManager.RoomExist(roomId))
            {

                Debug.WriteLine($"Inside: {roomId}");
                return View("Invalid");
            }

            return View("Room", roomId);
        }

        [Route("/Start")]
        public IActionResult Start()
        {
            string newRoomId = RoomIdGenerator.Create();
            _roomManager.AddRoom(new Room(newRoomId));

            return Redirect($"/Connect/{newRoomId}");
        }
    }
}
