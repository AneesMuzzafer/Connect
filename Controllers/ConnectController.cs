using Microsoft.AspNetCore.Mvc;

namespace Connect.Controllers
{
    public class ConnectController : Controller
    {
        [Route("/Connect")]
        public IActionResult Index()
        {
            return View();
        }

        [Route("/Connect/{id}")]
        public IActionResult Meeting(string id)
        {
            return View("Room", id);
        }
    }
}
